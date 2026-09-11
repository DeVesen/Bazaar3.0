using BAR.Modules.Anmeldung.Application.Articles.GetAll;
using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Anmeldung.Domain.Articles;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Anmeldung.Domain.Ports.Queries;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.Articles.GetAll;

public class GetAllArticlesQueryHandlerTests
{
    private readonly Mock<IArticleQueries> _queries = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IVerkaeuferverwaltungModuleApi> _verkaeuferverwaltung = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    private GetAllArticlesQueryHandler CreateHandler() => new(_queries.Object, _blocks.Object, _verkaeuferverwaltung.Object);

    [Fact]
    public async Task HandleAsync_MapsSellerInfoIntoResult()
    {
        var article = Article.Create("s1", 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        _queries.Setup(q => q.SearchAllAsync(null, null, null, null, null, 1, 25, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ArticleSearchPage([article], 1));
        _blocks.Setup(b => b.GetForSellerAsync("s1", It.IsAny<CancellationToken>()))
            .ReturnsAsync([NumberBlock.Assign("s1", 101, 10, Now)]);
        _verkaeuferverwaltung.Setup(v => v.GetSellerNamesAsync(It.Is<IReadOnlyCollection<string>>(ids => ids.Contains("s1")), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, SellerNameDto> { ["s1"] = new("s1", "Anna", "Beispiel") });

        var result = await CreateHandler().HandleAsync(
            new GetAllArticlesQuery(null, null, null, null, 1, 25, null), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Anna", result.Items[0].Seller.FirstName);
        Assert.Equal(101, result.Items[0].Seller.StartNumber);
    }

    [Fact]
    public async Task HandleAsync_SearchTermGiven_ResolvesMatchingSellerIdsFirst()
    {
        _verkaeuferverwaltung.Setup(v => v.FindSellerIdsByNameAsync("Anna", It.IsAny<CancellationToken>()))
            .ReturnsAsync(["s1"]);
        _queries.Setup(q => q.SearchAllAsync(null, null, "Anna", null, It.Is<IReadOnlyCollection<string>>(ids => ids != null && ids.Contains("s1")), 1, 25, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ArticleSearchPage([], 0));
        _verkaeuferverwaltung.Setup(v => v.GetSellerNamesAsync(It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, SellerNameDto>());

        var result = await CreateHandler().HandleAsync(
            new GetAllArticlesQuery(null, null, "Anna", null, 1, 25, null), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.TotalCount);
        _verkaeuferverwaltung.Verify(v => v.FindSellerIdsByNameAsync("Anna", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownSellerName_FallsBackToPlaceholder()
    {
        var article = Article.Create("s1", 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        _queries.Setup(q => q.SearchAllAsync(null, null, null, null, null, 1, 25, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ArticleSearchPage([article], 1));
        _blocks.Setup(b => b.GetForSellerAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _verkaeuferverwaltung.Setup(v => v.GetSellerNamesAsync(It.IsAny<IReadOnlyCollection<string>>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(new Dictionary<string, SellerNameDto>());

        var result = await CreateHandler().HandleAsync(
            new GetAllArticlesQuery(null, null, null, null, 1, 25, null), TestContext.Current.CancellationToken);

        Assert.Equal("?", result.Items[0].Seller.FirstName);
        Assert.Equal(0, result.Items[0].Seller.StartNumber);
    }
}
