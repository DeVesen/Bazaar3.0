using System.Text;
using Bazaar.Application.Import;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Brands;
using Bazaar.Domain.Categories;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;
using Moq;

namespace Bazaar.Application.UnitTests.Import;

public class RunImportHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<IBrandRepository> _brandRepository = new();
    private readonly Mock<ICategoryRepository> _categoryRepository = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypeRepository = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public RunImportHandlerTests()
    {
        _sellerRepository.Setup(r => r.GetById(It.IsAny<string>())).ReturnsAsync((Seller?)null);
        _articleRepository.Setup(r => r.GetAllBySellerId(It.IsAny<string>())).ReturnsAsync(Array.Empty<Article>());
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase(It.IsAny<string>())).ReturnsAsync(false);
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase(It.IsAny<string>())).ReturnsAsync(false);
        _sellerTypeRepository.Setup(r => r.GetAll())
            .ReturnsAsync([SellerType.Create("SELLERTYPE001", "Privat", 10m, 3m)]);

        // The real EfUnitOfWork opens a transaction and invokes the action —
        // here we just invoke the action directly so handler logic (including
        // any exception it throws) runs exactly as it would inside the
        // transaction, without a real database. (Same approach as
        // IntakeHandlerTests.)
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private RunImportHandler CreateSut() => new(
        _sellerRepository.Object,
        _articleRepository.Object,
        _brandRepository.Object,
        _categoryRepository.Object,
        _sellerTypeRepository.Object,
        _idGenerator.Object,
        _unitOfWork.Object);

    private static ImportOptionsCommand Options(
        Dictionary<string, string>? sellerTypeMapping = null,
        bool importBrands = false,
        bool importCategories = false) => new()
    {
        SellerTypeMapping = sellerTypeMapping ?? new Dictionary<string, string>(),
        ImportBrands = importBrands,
        ImportCategories = importCategories,
    };

    private static Stream ToStream(string json) => new MemoryStream(Encoding.UTF8.GetBytes(json));

    private static string JsonWithSellers(string sellersJson, string brandsJson = "[]", string categoriesJson = "[]") =>
        $$"""
        {
          "exportedAt": "2026-06-14T08:00:00Z",
          "sellers": [{{sellersJson}}],
          "brands": {{brandsJson}},
          "categories": {{categoriesJson}}
        }
        """;

    private static string SellerJson(
        string id = "SELLER001",
        string firstName = "Anna",
        string lastName = "Meier",
        string sellerType = "Privat",
        string articlesJson = "") =>
        $$"""
        {
          "id": "{{id}}",
          "firstName": "{{firstName}}",
          "lastName": "{{lastName}}",
          "city": "Karlsruhe",
          "email": "anna@example.org",
          "sellerType": "{{sellerType}}",
          "articles": [{{articlesJson}}]
        }
        """;

    private static string ArticleJson(string id = "ARTICLE001", int number = 1) =>
        $$"""
        {
          "id": "{{id}}",
          "number": {{number}},
          "name": "Winterjacke",
          "brand": "Nike",
          "category": "Jacken",
          "price": 12.00
        }
        """;

    private static Seller ExistingSeller(string id = "SELLER001") =>
        Seller.Create(id, "Anna", "Meier", null, null, "Karlsruhe", null, "anna@example.org", "SELLERTYPE001", 10m, 3m);

    private static Article ExistingArticle(string id = "ARTICLE-OLD", string sellerId = "SELLER001") =>
        Article.Create(id, 500, sellerId, "Alt", "AlteMarke", "AlteKategorie", 5m, null, null, null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    private static Article SoldArticle(string id = "ARTICLE999", string sellerId = "SELLER001")
    {
        var now = DateTimeOffset.UtcNow;
        var article = Article.Create(id, 999, sellerId, "Verkauft", "Nike", "Jacken", 5m, null, null, null, now, now);
        article.SetTimestamps(releasedAt: now, soldAt: now, returnedAt: null, manually: false, now: now);
        return article;
    }

    [Fact]
    public async Task Handle_SellerNotExisting_CreatesSellerWithResolvedConditionsAndArticles()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001", articlesJson: ArticleJson("ARTICLE001", 1)));
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), Options(), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.ImportedSellers);
        Assert.Equal(1, result.ImportedArticles);
        Assert.Equal(0, result.SkippedSellers);

        _sellerRepository.Verify(r => r.Add(It.Is<Seller>(s =>
            s.Id == "SELLER001" &&
            s.SellerTypeId == "SELLERTYPE001" &&
            s.SalesCommission == 10m &&
            s.FeePerItem == 3m)), Times.Once);

        _articleRepository.Verify(r => r.Add(It.Is<Article>(a =>
            a.Id == "ARTICLE001" &&
            a.SellerId == "SELLER001" &&
            a.AcceptedAt == null &&
            a.ReleasedAt == null &&
            a.SoldAt == null &&
            a.ReturnedAt == null &&
            a.SoldManually == false)), Times.Once);
    }

    [Fact]
    public async Task Handle_SellerWithoutEmail_CreatesSellerWithNullEmail()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001").Replace("\"email\": \"anna@example.org\",", string.Empty));
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), Options(), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.ImportedSellers);
        _sellerRepository.Verify(r => r.Add(It.Is<Seller>(s => s.Id == "SELLER001" && s.Email == null)), Times.Once);
    }

    [Fact]
    public async Task Handle_SellerExistsNotSoldNotSettled_RemovesOldSellerAndArticlesAndAddsNewOnes()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001", articlesJson: ArticleJson("ARTICLE-NEW", 1)));
        var existing = ExistingSeller("SELLER001");
        var oldArticle = ExistingArticle("ARTICLE-OLD", "SELLER001");
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(existing);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync([oldArticle]);
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), Options(), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.ImportedSellers);
        Assert.Equal(1, result.ImportedArticles);
        Assert.Equal(0, result.SkippedSellers);

        _articleRepository.Verify(r => r.Remove(oldArticle), Times.Once);
        _sellerRepository.Verify(r => r.Remove(existing), Times.Once);
        _sellerRepository.Verify(r => r.Add(It.Is<Seller>(s => s.Id == "SELLER001")), Times.Once);
        _articleRepository.Verify(r => r.Add(It.Is<Article>(a => a.Id == "ARTICLE-NEW")), Times.Once);
    }

    [Fact]
    public async Task Handle_SellerExistsWithSoldArticle_IsSkippedAndLeftCompletelyUntouched()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001", articlesJson: ArticleJson("ARTICLE-NEW", 1)));
        var existing = ExistingSeller("SELLER001");
        var soldArticle = SoldArticle("ARTICLE999", "SELLER001");
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(existing);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync([soldArticle]);
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), Options(), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.ImportedSellers);
        Assert.Equal(0, result.ImportedArticles);
        Assert.Equal(1, result.SkippedSellers);

        _sellerRepository.Verify(r => r.Remove(It.IsAny<Seller>()), Times.Never);
        _sellerRepository.Verify(r => r.Add(It.IsAny<Seller>()), Times.Never);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
        _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SellerExistsSettledButNoSoldArticles_IsAlsoSkipped()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001", articlesJson: ArticleJson("ARTICLE-NEW", 1)));
        var settled = ExistingSeller("SELLER001");
        settled.Settle(100m, DateTimeOffset.UtcNow);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(settled);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync(Array.Empty<Article>());
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), Options(), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.ImportedSellers);
        Assert.Equal(1, result.SkippedSellers);

        _sellerRepository.Verify(r => r.Remove(It.IsAny<Seller>()), Times.Never);
        _sellerRepository.Verify(r => r.Add(It.IsAny<Seller>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SellerTypeMapping_ResolvesUnknownNameToMappedTypesConditions()
    {
        _sellerTypeRepository.Setup(r => r.GetAll())
            .ReturnsAsync([
                SellerType.Create("SELLERTYPE001", "Privat", 10m, 3m),
                SellerType.Create("SELLERTYPE002", "Verein", 5m, 1m),
            ]);
        var json = JsonWithSellers(SellerJson(id: "SELLER001", sellerType: "Verein e.V."));
        var options = Options(sellerTypeMapping: new Dictionary<string, string> { ["Verein e.V."] = "SELLERTYPE002" });
        var sut = CreateSut();

        await sut.Handle(ToStream(json), options, TestContext.Current.CancellationToken);

        _sellerRepository.Verify(r => r.Add(It.Is<Seller>(s =>
            s.SellerTypeId == "SELLERTYPE002" &&
            s.SalesCommission == 5m &&
            s.FeePerItem == 1m)), Times.Once);
    }

    [Fact]
    public async Task Handle_SellerTypeNeitherMatchedNorMapped_ThrowsConflictAndWritesNothing()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001", sellerType: "Verein"));
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(
            () => sut.Handle(ToStream(json), Options(), TestContext.Current.CancellationToken));

        Assert.Equal("import.unmapped_seller_type", exception.ErrorCode);
        _sellerRepository.Verify(r => r.Add(It.IsAny<Seller>()), Times.Never);
        _sellerRepository.Verify(r => r.Remove(It.IsAny<Seller>()), Times.Never);
        _articleRepository.Verify(r => r.Add(It.IsAny<Article>()), Times.Never);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ImportBrandsFalse_NoBrandsAddedEvenIfFileHasNewOnes()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001"), brandsJson: """["Nike", "Puma"]""");
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), Options(importBrands: false), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.ImportedBrands);
        _brandRepository.Verify(r => r.Add(It.IsAny<Brand>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ImportCategoriesFalse_NoCategoriesAddedEvenIfFileHasNewOnes()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001"), categoriesJson: """["Jacken", "Hosen"]""");
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), Options(importCategories: false), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.ImportedCategories);
        _categoryRepository.Verify(r => r.Add(It.IsAny<Category>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ImportBrandsTrueWithSomeExisting_OnlyAddsGenuinelyNewOnes()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001"), brandsJson: """["Nike", "Puma"]""");
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase("Nike")).ReturnsAsync(true);
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase("Puma")).ReturnsAsync(false);
        _idGenerator.Setup(g => g.Generate()).Returns("BRAND001");
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), Options(importBrands: true), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.ImportedBrands);
        _brandRepository.Verify(r => r.Add(It.Is<Brand>(b => b.Name == "Puma" && b.Original)), Times.Once);
        _brandRepository.Verify(r => r.Add(It.Is<Brand>(b => b.Name == "Nike")), Times.Never);
    }

    [Fact]
    public async Task Handle_ImportCategoriesTrueWithSomeExisting_OnlyAddsGenuinelyNewOnes()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001"), categoriesJson: """["Jacken", "Hosen"]""");
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase("Jacken")).ReturnsAsync(true);
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase("Hosen")).ReturnsAsync(false);
        _idGenerator.Setup(g => g.Generate()).Returns("CATEGORY001");
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), Options(importCategories: true), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.ImportedCategories);
        _categoryRepository.Verify(r => r.Add(It.Is<Category>(c => c.Name == "Hosen" && c.Original)), Times.Once);
        _categoryRepository.Verify(r => r.Add(It.Is<Category>(c => c.Name == "Jacken")), Times.Never);
    }

    [Fact]
    public async Task Handle_MidLoopFailure_PropagatesExceptionAndDoesNotSwallowIt()
    {
        var json = JsonWithSellers(
            SellerJson(id: "SELLER001", articlesJson: ArticleJson("ARTICLE001", 1)) + "," +
            SellerJson(id: "SELLER002", articlesJson: ArticleJson("ARTICLE002", 2)));

        var callCount = 0;
        _sellerRepository.Setup(r => r.Add(It.IsAny<Seller>())).Returns(() =>
        {
            callCount++;
            if (callCount == 2)
            {
                throw new InvalidOperationException("Simulated failure on second seller Add");
            }

            return Task.CompletedTask;
        });

        var sut = CreateSut();

        await Assert.ThrowsAsync<InvalidOperationException>(
            () => sut.Handle(ToStream(json), Options(), TestContext.Current.CancellationToken));
    }
}
