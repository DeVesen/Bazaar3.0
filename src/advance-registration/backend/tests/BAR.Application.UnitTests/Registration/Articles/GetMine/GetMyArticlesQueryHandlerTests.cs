using BAR.Modules.Registration.Application.Articles.GetMine;
using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Registration.Articles.GetMine;

public class GetMyArticlesQueryHandlerTests
{
    private readonly Mock<IArticleQueries> _queries = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task HandleAsync_MapsPageToResult()
    {
        var article = Article.Create("s1", 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        _queries.Setup(q => q.SearchMineAsync("s1", "Nike", null, null, 1, 25, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ArticleSearchPage([article], 1));
        var handler = new GetMyArticlesQueryHandler(_queries.Object);

        var result = await handler.HandleAsync(
            new GetMyArticlesQuery("s1", "Nike", null, null, 1, 25, null), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal(101, result.Items[0].Number);
        Assert.Equal(1, result.Page);
        Assert.Equal(25, result.PageSize);
    }
}
