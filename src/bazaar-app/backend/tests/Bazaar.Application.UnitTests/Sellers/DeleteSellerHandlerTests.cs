using Bazaar.Application.Sellers;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Sellers;

public class DeleteSellerHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IArticleRepository> _articleRepository = new();

    private DeleteSellerHandler CreateSut() =>
        new(_sellerRepository.Object, _articleRepository.Object);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, "Karlsruhe", null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    private static Article CreateArticle(string id, int number) =>
        Article.Create(
            id, number, "SELLER001", "T-Shirt", "Adidas", "Kleidung", 10m,
            "M", "blau", null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("SELLER001"));

        Assert.Equal("seller.not_found", exception.ErrorCode);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NoArticles_RemovesSeller()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync([]);
        var sut = CreateSut();

        await sut.Handle("SELLER001");

        _sellerRepository.Verify(r => r.Remove(seller), Times.Once);
    }

    [Fact]
    public async Task Handle_SellerHasArticles_RemovesAllArticlesAndSeller()
    {
        var seller = CreateSeller();
        var articles = new List<Article> { CreateArticle("ARTICLE001", 1), CreateArticle("ARTICLE002", 2) };
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync(articles);
        var sut = CreateSut();

        await sut.Handle("SELLER001");

        _articleRepository.Verify(r => r.Remove(articles[0]), Times.Once);
        _articleRepository.Verify(r => r.Remove(articles[1]), Times.Once);
        _sellerRepository.Verify(r => r.Remove(seller), Times.Once);
    }
}
