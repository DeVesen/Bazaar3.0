using BAR.Domain.Articles;
using BAR.Domain.Ports.Queries;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class HomeQueriesTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public HomeQueriesTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task GetSellerHomeAsync_KnownSeller_ReturnsArticleCountAndResolvedType()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IHomeQueries>();
        var ct = TestContext.Current.CancellationToken;

        var seller = Domain.Sellers.Seller.Register("Anna", "Beispiel", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await sellers.AddAsync(seller, ct);
        await articles.CreateAsync(Article.Create(seller.Id, 4001, "A1", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);
        await articles.CreateAsync(Article.Create(seller.Id, 4002, "A2", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);

        var result = await queries.GetSellerHomeAsync(seller.Id, ct);

        Assert.NotNull(result);
        Assert.Equal(2, result!.ArticleCount);
        Assert.Equal(15.0m, result.CommissionRate);
        Assert.Equal(0.5m, result.ItemFee);
    }

    [Fact]
    public async Task GetSellerHomeAsync_UnknownSeller_ReturnsNull()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var queries = scope.ServiceProvider.GetRequiredService<IHomeQueries>();

        var result = await queries.GetSellerHomeAsync("unknown1", TestContext.Current.CancellationToken);

        Assert.Null(result);
    }

    [Fact]
    public async Task GetAdminHomeAsync_CountsSellersArticlesCategoriesBrandsAndBuildsHeatmap()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IHomeQueries>();
        var ct = TestContext.Current.CancellationToken;

        var seller = Domain.Sellers.Seller.Register("Bert", "Beispiel", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await sellers.AddAsync(seller, ct);
        await articles.CreateAsync(Article.Create(seller.Id, 5001, "A1", "Nike", "Schuhe", 1m, null, null, null, Now), null, ct);

        var result = await queries.GetAdminHomeAsync(Now.AddDays(-84), ct);

        Assert.True(result.SellerCount >= 1);
        Assert.True(result.ArticleCount >= 1);
        Assert.Contains(result.HeatmapData, d => d.Date == DateOnly.FromDateTime(Now.Date) && d.Count >= 1);
    }

    [Fact]
    public async Task GetAdminHomeAsync_ArticleOutsideWindow_ExcludedFromHeatmap()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<Domain.Ports.ISellerRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<Domain.Ports.IArticleRepository>();
        var queries = scope.ServiceProvider.GetRequiredService<IHomeQueries>();
        var ct = TestContext.Current.CancellationToken;

        var oldDate = Now.AddDays(-200);
        var seller = Domain.Sellers.Seller.Register("Clara", "Beispiel", null, "12345", "Ort", "000",
            $"{Guid.NewGuid()}@example.com", "t0000001", "hash");
        await sellers.AddAsync(seller, ct);
        await articles.CreateAsync(Article.Create(seller.Id, 6001, "Alt", "Nike", "Schuhe", 1m, null, null, null, oldDate), null, ct);

        var result = await queries.GetAdminHomeAsync(Now.AddDays(-84), ct);

        Assert.DoesNotContain(result.HeatmapData, d => d.Date == DateOnly.FromDateTime(oldDate.Date));
    }
}
