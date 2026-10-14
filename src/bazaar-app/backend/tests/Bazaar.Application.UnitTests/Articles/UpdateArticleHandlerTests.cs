using Bazaar.Application.Articles;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Articles;

public class UpdateArticleHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();

    private UpdateArticleHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object);

    private static Article CreateArticle(bool sold = false) =>
        Article.Create(
            "ARTICLE001", 1, "SELLER001", "T-Shirt", "Adidas", "Kleidung", 10m,
            "M", "blau", null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, "Karlsruhe", null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    private static UpdateArticleCommand CreateCommand(decimal price = 10m, int number = 1) => new()
    {
        Id = "ARTICLE001",
        Number = number,
        Name = "T-Shirt Neu",
        Brand = "Puma",
        Category = "Kleidung",
        Price = price,
        Size = "L",
        Color = "rot",
        Description = "gebraucht"
    };

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithArticleNotFoundCode()
    {
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync((Article?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(CreateCommand()));

        Assert.Equal("article.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_SellerSettled_ThrowsConflictWithSettlementLockedCode_AndDoesNotCallUpdate()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        seller.Settle(100m, DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(CreateCommand()));

        Assert.Equal("settlement.locked", exception.ErrorCode);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SellerNotSettledArticleNotSold_UpdatesSucceedsWithNewFieldValues()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        await sut.Handle(CreateCommand(price: 15m));

        Assert.Equal("T-Shirt Neu", article.Name);
        Assert.Equal("Puma", article.Brand);
        Assert.Equal("Kleidung", article.Category);
        Assert.Equal(15m, article.Price);
        Assert.Equal("L", article.Size);
        Assert.Equal("rot", article.Color);
        Assert.Equal("gebraucht", article.Description);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    [Fact]
    public async Task Handle_ArticleSoldPriceUnchanged_Succeeds()
    {
        var article = CreateArticle();
        article.SetTimestamps(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, true, DateTimeOffset.UtcNow);
        var seller = CreateSeller();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        await sut.Handle(CreateCommand(price: 10m));

        Assert.Equal("T-Shirt Neu", article.Name);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    [Fact]
    public async Task Handle_ArticleSoldPriceChanged_PropagatesArticleSoldConflictException()
    {
        var article = CreateArticle();
        article.SetTimestamps(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, true, DateTimeOffset.UtcNow);
        var seller = CreateSeller();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(CreateCommand(price: 99m)));

        Assert.Equal("article.sold", exception.ErrorCode);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    private static Article CreateOtherArticle(int number) =>
        Article.Create(
            "ARTICLE002", number, "SELLER001", "Hose", "Nike", "Kleidung", 5m,
            null, null, null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    [Fact]
    public async Task Handle_NewNumberFree_RenumbersArticleAndUpdates()
    {
        // Arrange
        var article = CreateArticle();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _articleRepository.Setup(r => r.GetByNumber(2000)).ReturnsAsync((Article?)null);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(CreateSeller());
        var sut = CreateSut();

        // Act
        await sut.Handle(CreateCommand(number: 2000));

        // Assert
        Assert.Equal(2000, article.Number);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    [Fact]
    public async Task Handle_NumberTakenByOtherArticle_ThrowsConflictWithNumberTakenCode_AndDoesNotCallUpdate()
    {
        // Arrange
        var article = CreateArticle();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _articleRepository.Setup(r => r.GetByNumber(1044)).ReturnsAsync(CreateOtherArticle(1044));
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(CreateSeller());
        var sut = CreateSut();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(CreateCommand(number: 1044)));

        Assert.Equal("article.number_taken", exception.ErrorCode);
        Assert.Equal("Artikelnummer 1044 ist bereits vergeben.", exception.Message);
        Assert.Equal(1, article.Number);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NumberUnchanged_DoesNotCheckAvailabilityAndUpdates()
    {
        // Arrange
        var article = CreateArticle();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(CreateSeller());
        var sut = CreateSut();

        // Act
        await sut.Handle(CreateCommand(number: 1));

        // Assert
        _articleRepository.Verify(r => r.GetByNumber(It.IsAny<int>()), Times.Never);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    [Fact]
    public async Task Handle_SellerSettledAndNumberChanged_ThrowsSettlementLocked_AndKeepsNumber()
    {
        // Arrange
        var article = CreateArticle();
        var seller = CreateSeller();
        seller.Settle(100m, DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(CreateCommand(number: 2000)));

        Assert.Equal("settlement.locked", exception.ErrorCode);
        Assert.Equal(1, article.Number);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ArticleSoldNumberChangedToFreeNumber_Renumbers()
    {
        // Arrange
        var article = CreateArticle();
        article.SetTimestamps(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, true, DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _articleRepository.Setup(r => r.GetByNumber(2000)).ReturnsAsync((Article?)null);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(CreateSeller());
        var sut = CreateSut();

        // Act
        await sut.Handle(CreateCommand(number: 2000));

        // Assert
        Assert.Equal(2000, article.Number);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }
}
