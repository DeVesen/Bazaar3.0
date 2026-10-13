using Bazaar.Application.Intake;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Intake;

public class GetArticleByNumberHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();

    private GetArticleByNumberHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object);

    private static Article CreateArticle() =>
        Article.Create(
            "ARTICLE001", 1043, "SELLER001", "Winterjacke", "Nike", "Jacken", 12m,
            null, null, null, DateTimeOffset.UtcNow, DateTimeOffset.UtcNow);

    private static Seller CreateSeller() =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, "Karlsruhe", null, "anna@example.org", "SELLERTYPE001", 10m, 0.5m);

    [Fact]
    public async Task Handle_UnknownNumber_ThrowsNotFoundWithArticleNumberUnknownCode()
    {
        _articleRepository.Setup(r => r.GetByNumber(1043)).ReturnsAsync((Article?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(1043));

        Assert.Equal("article.number_unknown", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_KnownNumber_ReturnsArticleWithSellerName()
    {
        var article = CreateArticle();
        var seller = CreateSeller();
        _articleRepository.Setup(r => r.GetByNumber(1043)).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sut = CreateSut();

        var (resultArticle, sellerName) = await sut.Handle(1043);

        Assert.Same(article, resultArticle);
        Assert.Equal("Anna Meier", sellerName);
    }

    [Fact]
    public async Task Handle_SellerNotFound_ReturnsEmptySellerName()
    {
        var article = CreateArticle();
        _articleRepository.Setup(r => r.GetByNumber(1043)).ReturnsAsync(article);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        var (_, sellerName) = await sut.Handle(1043);

        Assert.Equal(string.Empty, sellerName);
    }
}
