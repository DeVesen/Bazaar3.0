using BAR.Modules.Anmeldung.Application.Articles.GetById;
using BAR.Modules.Anmeldung.Domain.Articles;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.Articles.GetById;

public class GetArticleByIdQueryHandlerTests
{
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IVerkaeuferverwaltungModuleApi> _verkaeuferverwaltung = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    private GetArticleByIdQueryHandler CreateHandler() => new(_articles.Object, _blocks.Object, _verkaeuferverwaltung.Object);

    [Fact]
    public async Task HandleAsync_KnownId_ReturnsArticleWithSeller()
    {
        var sellerId = "s1234567";
        var article = Article.Create(sellerId, 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        _verkaeuferverwaltung.Setup(v => v.GetSellerNamesAsync(It.Is<IReadOnlyCollection<string>>(ids => ids.Contains(sellerId)), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, SellerNameDto> { [sellerId] = new(sellerId, "Anna", "Beispiel") });
        _blocks.Setup(b => b.GetForSellerAsync(sellerId, It.IsAny<CancellationToken>()))
            .ReturnsAsync([NumberBlock.Assign(sellerId, 101, 10, Now)]);

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

    [Fact]
    public async Task HandleAsync_SellerNameUnknown_ThrowsNotFound()
    {
        var sellerId = "s1234567";
        var article = Article.Create(sellerId, 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        _articles.Setup(a => a.GetByIdAsync("a1", It.IsAny<CancellationToken>())).ReturnsAsync(article);
        _verkaeuferverwaltung.Setup(v => v.GetSellerNamesAsync(It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, SellerNameDto>());

        var ex = await Assert.ThrowsAsync<NotFoundException>(() =>
            CreateHandler().HandleAsync("a1", TestContext.Current.CancellationToken));

        Assert.Equal("article.not_found", ex.ErrorCode);
    }
}
