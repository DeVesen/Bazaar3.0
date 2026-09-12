using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Registration.Domain.Ports.Queries;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class ArticleQueriesTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticleQueriesTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task SearchMineAsync_FiltersByBrandAndPaginates()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        await articles.CreateAsync(Article.Create(sellerId, 1001, "A1", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(sellerId, 1002, "A2", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(sellerId, 1003, "A3", "Adidas", "Schuhe", 1m, null, null, null, Now), null, ct);

        var page = await queries.SearchMineAsync(sellerId, brand: "Nike", category: null, search: null, page: 1, pageSize: 25, sort: null, ct);

        Assert.Equal(2, page.TotalCount);
        Assert.All(page.Items, a => Assert.Equal("Nike", a.Brand));
    }

    [Fact]
    public async Task SearchMineAsync_SortByPriceDescending_OrdersResults()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        await articles.CreateAsync(Article.Create(sellerId, 2001, "Billig", "M", "K", 3m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(sellerId, 2002, "Teuer", "M", "K", 30m, null, null, null, Now), null, ct);

        var page = await queries.SearchMineAsync(sellerId, null, null, null, 1, 25, sort: "price:desc", ct);

        Assert.Equal("Teuer", page.Items[0].Name);
        Assert.Equal("Billig", page.Items[1].Name);
    }

    [Fact]
    public async Task SearchAllAsync_FiltersBySellerIdWhenGiven()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var otherSellerId = Guid.NewGuid().ToString("N")[..8];
        await articles.CreateAsync(Article.Create(sellerId, 3001, "X", "M", "K", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(otherSellerId, 3002, "Y", "M", "K", 1m, null, null, null, Now), null, ct);

        // searchMatchingSellerIds: null, because this test does not simulate a
        // name search result - the caller (GetAllArticlesQueryHandler) resolves
        // that upfront via SellerManagement.Contracts, not the query itself.
        var page = await queries.SearchAllAsync(null, null, search: null, sellerId: sellerId, searchMatchingSellerIds: null, 1, 25, null, ct);

        Assert.Single(page.Items);
        Assert.Equal(3001, page.Items[0].Number);
    }

    [Fact]
    public async Task SearchAllAsync_SearchMatchingSellerIdsGiven_IncludesArticlesFromThoseSellers()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;
        var matchingSellerId = Guid.NewGuid().ToString("N")[..8];
        var otherSellerId = Guid.NewGuid().ToString("N")[..8];
        // Neither name, category nor brand match "Anna" - only the
        // pre-resolved searchMatchingSellerIds hit may include the article.
        await articles.CreateAsync(Article.Create(matchingSellerId, 4001, "Jacke", "M", "K", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(otherSellerId, 4002, "Hose", "M", "K", 1m, null, null, null, Now), null, ct);

        var page = await queries.SearchAllAsync(
            null, null, search: "Anna", sellerId: null, searchMatchingSellerIds: [matchingSellerId], 1, 25, null, ct);

        var matched = page.Items.Where(a => a.Number is 4001 or 4002).ToList();
        Assert.Single(matched);
        Assert.Equal(4001, matched[0].Number);
    }

    [Fact]
    public async Task SearchAllAsync_SortBySeller_FallsBackToNumberSortSinceNoSellerNameInThisSchema()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        await articles.CreateAsync(Article.Create(sellerId, 5002, "X2", "M", "K", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(sellerId, 5001, "X1", "M", "K", 1m, null, null, null, Now), null, ct);

        // "seller" is to be treated like any unknown sort value (no more name
        // field in this schema) - falls back to ascending number.
        var page = await queries.SearchAllAsync(null, null, search: null, sellerId: sellerId, searchMatchingSellerIds: null, 1, 25, sort: "seller:desc", ct);

        Assert.Equal(5001, page.Items[0].Number);
        Assert.Equal(5002, page.Items[1].Number);
    }
}
