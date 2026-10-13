using Bazaar.Application.Articles;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Articles;

public class GetArticleByIdHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();

    private GetArticleByIdHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object);

    private static Article CreateArticle() =>
        Article.Create(
            "ARTICLE001", 1, "SELLER001", "T-Shirt", "Adidas", "Kleidung", 10m,
            "M", "blau", null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, "Karlsruhe", null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithArticleNotFoundCode()
    {
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync((Article?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("ARTICLE001"));

        Assert.Equal("article.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_KnownId_ReturnsArticleWithSellerNameAndSettledAt()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        seller.Settle(100m, DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var (resultArticle, sellerName, sellerSettledAt) = await sut.Handle("ARTICLE001");

        Assert.Same(article, resultArticle);
        Assert.Equal("Anna Meier", sellerName);
        Assert.NotNull(sellerSettledAt);
    }

    [Fact]
    public async Task Handle_SellerNotSettled_ReturnsNullSettledAt()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var (_, _, sellerSettledAt) = await sut.Handle("ARTICLE001");

        Assert.Null(sellerSettledAt);
    }
}
