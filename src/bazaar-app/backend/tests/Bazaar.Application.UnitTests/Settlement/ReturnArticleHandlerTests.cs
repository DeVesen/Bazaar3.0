using Bazaar.Application.Settlement;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Settlement;

public class ReturnArticleHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();

    private ReturnArticleHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object);

    private static Seller CreateSeller(string id = "SELLER001") =>
        Seller.Create(id, "Anna", "Meier", null, null, "Karlsruhe", null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    private static Article CreateReleasedArticle(string id = "ARTICLE001", int number = 1044, string sellerId = "SELLER001")
    {
        var article = Article.Create(
            id, number, sellerId, "Winterjacke", "Nike", "Jacken", 12.00m,
            "128", "rot", null, DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddDays(-1));
        article.MarkReleased(DateTimeOffset.UtcNow);
        return article;
    }

    [Fact]
    public async Task Handle_ArticleAlreadySold_ThrowsConflictWithArticleSoldCode_AndDoesNotUpdate()
    {
        var seller = CreateSeller();
        var article = CreateReleasedArticle();
        article.RecordSale(DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle("ARTICLE001", DateTimeOffset.UtcNow));

        Assert.Equal("article.sold", exception.ErrorCode);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SellerAlreadySettled_ThrowsConflictWithSettlementLockedCode_AndDoesNotUpdate()
    {
        var seller = CreateSeller();
        seller.Settle(332.94m, DateTimeOffset.UtcNow);
        var article = CreateReleasedArticle();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle("ARTICLE001", DateTimeOffset.UtcNow));

        Assert.Equal("settlement.locked", exception.ErrorCode);
        Assert.Null(article.ReturnedAt);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_UnsoldArticleUnsettledSeller_SetsReturnedAtAndUpdatesArticle()
    {
        var seller = CreateSeller();
        var article = CreateReleasedArticle();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();
        var now = DateTimeOffset.UtcNow;

        await sut.Handle("ARTICLE001", now);

        Assert.Equal(now, article.ReturnedAt);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    [Fact]
    public async Task Handle_ArticleNotFound_ThrowsNotFoundWithArticleNotFoundCode()
    {
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync((Article?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("ARTICLE001", DateTimeOffset.UtcNow));

        Assert.Equal("article.not_found", exception.ErrorCode);
        _sellerRepository.Verify(r => r.GetById(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SellerNotFound_ThrowsNotFoundWithSellerNotFoundCode()
    {
        var article = CreateReleasedArticle();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("ARTICLE001", DateTimeOffset.UtcNow));

        Assert.Equal("seller.not_found", exception.ErrorCode);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }
}
