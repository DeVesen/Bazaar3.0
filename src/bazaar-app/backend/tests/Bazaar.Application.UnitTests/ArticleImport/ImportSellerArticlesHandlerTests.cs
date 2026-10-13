using Bazaar.Application.ArticleImport;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Brands;
using Bazaar.Domain.Categories;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.ArticleImport;

public class ImportSellerArticlesHandlerTests
{
    private const string SellerId = "SELLER001";
    private const string OtherSellerId = "SELLER002";

    private static readonly object?[] Header = ["Nr", "Bezeichnung", "Kategorie", "Marke", "Größe", "Preis"];

    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<IBrandRepository> _brandRepository = new();
    private readonly Mock<ICategoryRepository> _categoryRepository = new();
    private readonly Mock<IArticleTableReader> _tableReader = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private int _idCounter;

    public ImportSellerArticlesHandlerTests()
    {
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
        _idGenerator.Setup(g => g.Generate()).Returns(() => $"ID{++_idCounter:000}");
        _sellerRepository.Setup(r => r.GetById(SellerId)).ReturnsAsync(CreateSeller(SellerId, "Anna", "Meier"));
        _sellerRepository.Setup(r => r.GetById(OtherSellerId)).ReturnsAsync(CreateSeller(OtherSellerId, "Bernd", "Kraus"));
        _articleRepository.Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>())).ReturnsAsync(Array.Empty<Article>());
        _brandRepository.Setup(r => r.GetAll()).ReturnsAsync(Array.Empty<Brand>());
        _categoryRepository.Setup(r => r.GetAll()).ReturnsAsync(Array.Empty<Category>());
    }

    private static Seller CreateSeller(string id, string firstName, string lastName) =>
        Seller.Create(id, firstName, lastName, null, null, "Karlsruhe", null, "mail@example.org", "SELLERTYPE001", 10m, 3m);

    private static Article CreateArticle(int number, string sellerId)
    {
        var now = DateTimeOffset.UtcNow;
        return Article.Create($"ART{number}", number, sellerId, "Mütze", "Nike", "Mützen", 5m, null, null, null, now, now);
    }

    private static object?[] Valid(int number, string category = "Ski Jacke", string brand = "Icepeak") =>
        [number.ToString(), "Jacke", category, brand, "128", "25"];

    private void SetupRows(params object?[][] rows) =>
        _tableReader
            .Setup(r => r.ReadRows(It.IsAny<Stream>(), It.IsAny<string>()))
            .Returns(rows);

    private ImportSellerArticlesHandler CreateSut() => new(
        _sellerRepository.Object,
        _articleRepository.Object,
        _brandRepository.Object,
        _categoryRepository.Object,
        _tableReader.Object,
        _idGenerator.Object,
        _unitOfWork.Object);

    private static Task<ImportSellerArticlesResult> Run(ImportSellerArticlesHandler sut, string? locale = "de-DE") =>
        sut.Handle(SellerId, Stream.Null, "artikel.csv", locale, CancellationToken.None);

    [Fact]
    public async Task Handle_ThreeValidRows_CreatesRegisteredArticlesForTileSeller()
    {
        // Arrange
        SetupRows(Header, Valid(3001), Valid(3002), Valid(3003));
        var sut = CreateSut();

        // Act
        var result = await Run(sut);

        // Assert
        Assert.Equal(3, result.ImportedCount);
        _articleRepository.Verify(
            r => r.Add(It.Is<Article>(a => a.SellerId == SellerId
                && a.Status == ArticleStatus.Registered
                && a.Name == "Jacke"
                && a.Size == "128"
                && a.Price == 25m)),
            Times.Exactly(3));
    }

    [Fact]
    public async Task Handle_NumberOwnedByOtherSeller_ThrowsWithRowNumberAndOwnerName()
    {
        // Arrange
        SetupRows(Header, Valid(3101), Valid(3102), Valid(3103), Valid(3104), Valid(3001));
        _articleRepository
            .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { CreateArticle(3001, OtherSellerId) });
        var sut = CreateSut();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
        Assert.Equal("import.invalid_rows", exception.ErrorCode);
        Assert.Contains("Zeile 6, Artikelnummer 3001", exception.Message);
        Assert.Contains("Bernd Kraus", exception.Message);
    }

    [Fact]
    public async Task Handle_NumberOwnedByTileSeller_ThrowsAndOverwritesNothing()
    {
        // Arrange
        SetupRows(Header, Valid(3001));
        _articleRepository
            .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { CreateArticle(3001, SellerId) });
        var sut = CreateSut();

        // Act
        await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));

        // Assert
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
        _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NumberOwnedByTileSeller_NamesTileSellerInMessage()
    {
        // Arrange
        SetupRows(Header, Valid(3001));
        _articleRepository
            .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { CreateArticle(3001, SellerId) });
        var sut = CreateSut();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
        Assert.Contains("Anna Meier", exception.Message);
    }

    [Fact]
    public async Task Handle_RowWithMissingField_ThrowsAndSavesNothing()
    {
        // Arrange
        SetupRows(Header, Valid(3001), ["3002", null, "Ski Jacke", "Icepeak", "128", "25"]);
        var sut = CreateSut();

        // Act
        await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));

        // Assert
        _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
        _brandRepository.Verify(r => r.Add(It.IsAny<Brand>()), Times.Never);
        _categoryRepository.Verify(r => r.Add(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_TwelveInvalidRows_ReportsErrorCountInExtensions()
    {
        // Arrange
        var rows = new List<object?[]> { Header };
        rows.AddRange(Enumerable.Range(0, 12).Select(index => new object?[] { (3000 + index).ToString(), "Jacke", "Ski Jacke", "Icepeak", "128", "0" }));
        SetupRows([.. rows]);
        var sut = CreateSut();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
        Assert.Equal(12, exception.Extensions["errorCount"]);
    }

    [Fact]
    public async Task Handle_UnknownBrandAndCategoryWithSpaces_CreatesThemAsNewTrimmed()
    {
        // Arrange
        SetupRows(Header, ["3001", "Jacke", "Ski Jacke", " Icepeak ", "128", "25"]);
        var sut = CreateSut();

        // Act
        await Run(sut);

        // Assert
        _brandRepository.Verify(r => r.Add(It.Is<Brand>(b => b.Name == "Icepeak" && !b.Original)), Times.Once);
        _categoryRepository.Verify(r => r.Add(It.Is<Category>(c => c.Name == "Ski Jacke" && !c.Original)), Times.Once);
    }

    [Fact]
    public async Task Handle_UnknownBrandAndCategory_ArticleCarriesTheNewNames()
    {
        // Arrange
        SetupRows(Header, ["3001", "Jacke", "Ski Jacke", " Icepeak ", "128", "25"]);
        var sut = CreateSut();

        // Act
        await Run(sut);

        // Assert
        _articleRepository.Verify(
            r => r.Add(It.Is<Article>(a => a.Brand == "Icepeak" && a.Category == "Ski Jacke")),
            Times.Once);
    }

    [Fact]
    public async Task Handle_BrandAndCategoryInOtherCase_ReusesExistingEntries()
    {
        // Arrange
        _brandRepository.Setup(r => r.GetAll()).ReturnsAsync(new[] { Brand.Create("B1", "Icepeak", original: true) });
        _categoryRepository.Setup(r => r.GetAll()).ReturnsAsync(new[] { Category.Create("C1", "Ski Jacke", original: true) });
        SetupRows(Header, Valid(3001, category: "ski jacke", brand: "ICEPEAK"));
        var sut = CreateSut();

        // Act
        await Run(sut);

        // Assert
        _articleRepository.Verify(
            r => r.Add(It.Is<Article>(a => a.Brand == "Icepeak" && a.Category == "Ski Jacke")),
            Times.Once);
    }

    [Fact]
    public async Task Handle_BrandAndCategoryInOtherCase_CreatesNoNewEntries()
    {
        // Arrange
        _brandRepository.Setup(r => r.GetAll()).ReturnsAsync(new[] { Brand.Create("B1", "Icepeak", original: true) });
        _categoryRepository.Setup(r => r.GetAll()).ReturnsAsync(new[] { Category.Create("C1", "Ski Jacke", original: true) });
        SetupRows(Header, Valid(3001, category: "ski jacke", brand: "ICEPEAK"));
        var sut = CreateSut();

        // Act
        await Run(sut);

        // Assert
        _brandRepository.Verify(r => r.Add(It.IsAny<Brand>()), Times.Never);
        _categoryRepository.Verify(r => r.Add(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_OnlyHeaderRow_ThrowsNoArticles()
    {
        // Arrange
        SetupRows(Header);
        var sut = CreateSut();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
        Assert.Equal("import.no_articles", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_OnlyNumberRowsAndBlankRows_ThrowsNoArticles()
    {
        // Arrange
        SetupRows(Header, ["3001"], [], [null, null, null, null, null, null]);
        var sut = CreateSut();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));
        Assert.Equal("import.no_articles", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_UnknownSeller_ThrowsNotFoundWithoutReadingFile()
    {
        // Arrange
        _sellerRepository.Setup(r => r.GetById(SellerId)).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        // Act
        await Assert.ThrowsAsync<NotFoundException>(() => Run(sut));

        // Assert
        _tableReader.Verify(r => r.ReadRows(It.IsAny<Stream>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SettledSeller_ThrowsSettlementLockedWithoutReadingFile()
    {
        // Arrange
        var settledSeller = CreateSeller(SellerId, "Anna", "Meier");
        settledSeller.Settle(0m, DateTimeOffset.UtcNow);
        _sellerRepository.Setup(r => r.GetById(SellerId)).ReturnsAsync(settledSeller);
        var sut = CreateSut();

        // Act
        var exception = await Assert.ThrowsAsync<ConflictException>(() => Run(sut));

        // Assert
        Assert.Equal("settlement.locked", exception.ErrorCode);
        _tableReader.Verify(r => r.ReadRows(It.IsAny<Stream>(), It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_GermanLocaleAndCommaPrice_ImportsWholePrice()
    {
        // Arrange
        SetupRows(Header, ["3001", "Jacke", "Ski Jacke", "Icepeak", "128", "199,00"]);
        var sut = CreateSut();

        // Act
        await Run(sut, locale: "de-DE");

        // Assert
        _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Price == 199m)), Times.Once);
    }

    [Fact]
    public async Task Handle_EnglishLocaleAndDotPrice_ImportsWholePrice()
    {
        // Arrange
        SetupRows(Header, ["3001", "Jacke", "Ski Jacke", "Icepeak", "128", "199.00"]);
        var sut = CreateSut();

        // Act
        await Run(sut, locale: "en-US");

        // Assert
        _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Price == 199m)), Times.Once);
    }

    [Fact]
    public async Task Handle_TakenNumberCheck_RunsInsideTransaction()
    {
        // Arrange
        var inTransaction = false;
        var checkedInTransaction = false;
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>(async (action, ct) =>
            {
                inTransaction = true;
                await action(ct);
                inTransaction = false;
            });
        _articleRepository
            .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
            .Callback(() => checkedInTransaction = inTransaction)
            .ReturnsAsync(Array.Empty<Article>());
        SetupRows(Header, Valid(3001));
        var sut = CreateSut();

        // Act
        await Run(sut);

        // Assert
        Assert.True(checkedInTransaction);
    }

    [Fact]
    public async Task Handle_NumberTakenAtCheckInsideTransaction_ThrowsInvalidRowsAndAddsNothing()
    {
        // Arrange
        SetupRows(Header, Valid(3001), Valid(3002));
        _articleRepository
            .Setup(r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new[] { CreateArticle(3002, OtherSellerId) });
        var sut = CreateSut();

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));

        // Assert
        Assert.Equal("import.invalid_rows", exception.ErrorCode);
        _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_MoreDataRowsThanLimit_ThrowsTooManyRowsWithoutTransaction()
    {
        // Arrange
        var rows = new List<object?[]> { Header };
        rows.AddRange(Enumerable.Range(1, ImportSellerArticlesHandler.MaxDataRows + 1).Select(number => Valid(number)));
        SetupRows([.. rows]);
        var sut = CreateSut();

        // Act
        var exception = await Assert.ThrowsAsync<BadRequestException>(() => Run(sut));

        // Assert
        Assert.Equal("import.too_many_rows", exception.ErrorCode);
        _unitOfWork.Verify(
            u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_ExactlyLimitDataRows_ImportsAllRows()
    {
        // Arrange
        var rows = new List<object?[]> { Header };
        rows.AddRange(Enumerable.Range(1, ImportSellerArticlesHandler.MaxDataRows).Select(number => Valid(number)));
        SetupRows([.. rows]);
        var sut = CreateSut();

        // Act
        var result = await Run(sut);

        // Assert
        Assert.Equal(ImportSellerArticlesHandler.MaxDataRows, result.ImportedCount);
    }

    [Fact]
    public async Task Handle_CancelledDuringSave_StopsAddingAndThrowsCancellation()
    {
        // Arrange
        using var cancellation = new CancellationTokenSource();
        _articleRepository
            .Setup(r => r.Add(It.IsAny<Article>()))
            .Callback(() => cancellation.Cancel())
            .Returns(Task.CompletedTask);
        SetupRows(Header, Valid(3001), Valid(3002), Valid(3003));
        var sut = CreateSut();

        // Act
        await Assert.ThrowsAnyAsync<OperationCanceledException>(
            () => sut.Handle(SellerId, Stream.Null, "artikel.csv", "de-DE", cancellation.Token));

        // Assert
        _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Once);
    }

    [Fact]
    public async Task Handle_TakenNumberCheck_PassesRequestTokenToRepository()
    {
        // Arrange
        using var cancellation = new CancellationTokenSource();
        SetupRows(Header, Valid(3001));
        var sut = CreateSut();

        // Act
        await sut.Handle(SellerId, Stream.Null, "artikel.csv", "de-DE", cancellation.Token);

        // Assert
        _articleRepository.Verify(
            r => r.GetByNumbers(It.IsAny<IReadOnlyCollection<int>>(), cancellation.Token),
            Times.Once);
    }
}
