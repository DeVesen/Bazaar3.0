using BAR.Domain.Articles;
using BAR.Domain.Ports.Queries;
using BAR.Host.IntegrationTests.Features.Public;
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
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
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
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
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
    public async Task SearchAllAsync_ReturnsSellerInfoPerItem()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
        var blocks = scope.ServiceProvider.GetRequiredService<Domain.Ports.INumberBlockRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;

        var seller = Domain.Sellers.Seller.Register("Anna", "Beispiel", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await sellers.AddAsync(seller, ct);
        await blocks.AddAsync(Domain.NumberBlocks.NumberBlock.Assign(seller.Id, 3001, 10, Now), ct);
        await articles.CreateAsync(Article.Create(seller.Id, 3001, "X", "M", "K", 1m, null, null, null, Now), null, ct);

        var page = await queries.SearchAllAsync(null, null, search: "3001", sellerId: null, 1, 25, null, ct);

        Assert.Single(page.Items);
        Assert.Equal("Anna", page.Items[0].SellerFirstName);
        Assert.Equal(3001, page.Items[0].SellerStartNumber);
    }

    [Fact]
    public async Task SearchAllAsync_SortBySellerDescending_OrdersByLastName()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IArticleQueries>();
        var ct = TestContext.Current.CancellationToken;

        var sellerA = Domain.Sellers.Seller.Register("Anna", "Ackermann", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        var sellerZ = Domain.Sellers.Seller.Register("Zora", "Zimmermann", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await sellers.AddAsync(sellerA, ct);
        await sellers.AddAsync(sellerZ, ct);
        await articles.CreateAsync(Article.Create(sellerA.Id, 4001, "X1", "M", "K", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(sellerZ.Id, 4002, "X2", "M", "K", 1m, null, null, null, Now), null, ct);

        var page = await queries.SearchAllAsync(null, null, search: null, sellerId: null, 1, 25, sort: "seller:desc", ct);

        var ordered = page.Items.Where(i => i.Article.Number is 4001 or 4002).ToList();
        Assert.Equal("Zimmermann", ordered[0].SellerLastName);
        Assert.Equal("Ackermann", ordered[1].SellerLastName);
    }
}
