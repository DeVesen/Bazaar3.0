using Bazaar.Application.Articles;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Articles;

public class DeleteArticleHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();

    private DeleteArticleHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object);

    private static Article CreateArticle() =>
        Article.Create(
            "ARTICLE001", 1, "SELLER001", "T-Shirt", "Adidas", "Kleidung", 10m,
            "M", "blau", null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, null, null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithArticleNotFoundCode()
    {
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync((Article?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("ARTICLE001"));

        Assert.Equal("article.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_SoldArticle_ThrowsConflictWithArticleSoldCode_AndDoesNotCallRemove()
    {
        var article = CreateArticle();
        article.SetTimestamps(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, true, DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle("ARTICLE001"));

        Assert.Equal("article.sold", exception.ErrorCode);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
        _sellerRepository.Verify(r => r.GetById(It.IsAny<string>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SettledSellerUnsoldArticle_ThrowsConflictWithSettlementLockedCode_AndDoesNotCallRemove()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        seller.Settle(100m, DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle("ARTICLE001"));

        Assert.Equal("settlement.locked", exception.ErrorCode);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_HappyPath_RemovesArticleOnce()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        await sut.Handle("ARTICLE001");

        _articleRepository.Verify(r => r.Remove(article), Times.Once);
    }
}
