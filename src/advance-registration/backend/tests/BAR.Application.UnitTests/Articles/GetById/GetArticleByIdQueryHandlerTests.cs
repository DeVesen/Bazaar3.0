using BAR.Application.Articles.GetById;
using BAR.Domain.Articles;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Articles.GetById;

public class GetArticleByIdQueryHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    private GetArticleByIdQueryHandler CreateHandler() => new(_articles.Object, _sellers.Object, _blocks.Object);

    [Fact]
    public async Task HandleAsync_KnownId_ReturnsArticleWithSeller()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "12345", "Ort", "000", "a@example.com", "t0000001", "hash");
        var article = Article.Create(seller.Id, 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _blocks.Setup(b => b.GetForSellerAsync(seller.Id, It.IsAny<CancellationToken>()))
            .ReturnsAsync([NumberBlock.Assign(seller.Id, 101, 10, Now)]);

        var result = await CreateHandler().HandleAsync("a1", TestContext.Current.CancellationToken);

        Assert.Equal("Anna", result.Seller.FirstName);
        Assert.Equal(101, result.Seller.StartNumber);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync((Article?)null);

        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            CreateHandler().HandleAsync("a1", TestContext.Current.CancellationToken));

        Assert.Equal("article.not_found", ex.ErrorCode);
    }
}
