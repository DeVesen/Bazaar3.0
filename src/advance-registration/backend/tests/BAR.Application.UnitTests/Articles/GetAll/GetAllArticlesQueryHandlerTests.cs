using BAR.Application.Articles.GetAll;
using BAR.Domain.Articles;
using BAR.Domain.Ports.Queries;
using Moq;

namespace BAR.Application.UnitTests.Articles.GetAll;

public class GetAllArticlesQueryHandlerTests
{
    private readonly Mock<IArticleQueries> _queries = new();
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task HandleAsync_MapsSellerInfoIntoResult()
    {
        var article = Article.Create("s1", 101, "Jacke", "Nike", "Jacken", 5m, null, null, null, Now);
        var withSeller = new ArticleWithSeller(article, "s1", 101, "Anna", "Beispiel");
        _queries.Setup(q => q.SearchAllAsync(null, null, null, null, 1, 25, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync(new ArticleAdminSearchPage([withSeller], 1));
        var handler = new GetAllArticlesQueryHandler(_queries.Object);

        var result = await handler.HandleAsync(
            new GetAllArticlesQuery(null, null, null, null, 1, 25, null), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.TotalCount);
        Assert.Equal("Anna", result.Items[0].Seller.FirstName);
        Assert.Equal(101, result.Items[0].Seller.StartNumber);
    }
}
