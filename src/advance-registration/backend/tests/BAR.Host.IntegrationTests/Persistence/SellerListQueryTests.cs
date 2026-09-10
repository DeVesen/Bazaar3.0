using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports.Queries;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class SellerListQueryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SellerListQueryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task ExecuteAsync_FiltersBySearchAcrossNameAndCity()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var query = scope.ServiceProvider.GetRequiredService<ISellerListQuery>();
        var dbContext = scope.ServiceProvider.GetRequiredService<BAR.Infrastructure.Persistence.BarDbContext>();
        var ct = TestContext.Current.CancellationToken;
        var marker = Guid.NewGuid().ToString("N")[..8];

        var type = SellerType.Create($"Standard-{Guid.NewGuid():N}", 15m, 0.5m);
        dbContext.SellerTypes.Add(type);
        var anna = Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", $"Karlsruhe-{marker}", "0721 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        var ben = Seller.CreateByAdmin("Ben", "Muster", null, "10115", $"Berlin-{marker}", "030 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        dbContext.Sellers.AddRange(anna, ben);
        await dbContext.SaveChangesAsync(ct);

        var (items, total) = await query.ExecuteAsync($"Karlsruhe-{marker}", 1, 25, [], ct);

        Assert.Equal(1, total);
        Assert.Equal("Anna", items[0].FirstName);
    }

    [Fact]
    public async Task ExecuteAsync_SortsByStartNumberDescending()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var query = scope.ServiceProvider.GetRequiredService<ISellerListQuery>();
        var dbContext = scope.ServiceProvider.GetRequiredService<BAR.Infrastructure.Persistence.BarDbContext>();
        var ct = TestContext.Current.CancellationToken;
        var marker = Guid.NewGuid().ToString("N")[..8];

        var type = SellerType.Create($"Standard-{Guid.NewGuid():N}", 15m, 0.5m);
        dbContext.SellerTypes.Add(type);
        var anna = Seller.CreateByAdmin("Anna", $"Beispiel-{marker}", null, "76133", "Karlsruhe", "0721 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        var ben = Seller.CreateByAdmin("Ben", $"Muster-{marker}", null, "10115", "Berlin", "030 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        dbContext.Sellers.AddRange(anna, ben);
        dbContext.NumberBlocks.Add(NumberBlock.Assign(anna.Id, 101, 10, DateTime.UtcNow));
        dbContext.NumberBlocks.Add(NumberBlock.Assign(ben.Id, 201, 10, DateTime.UtcNow));
        await dbContext.SaveChangesAsync(ct);

        var (items, total) = await query.ExecuteAsync(marker, 1, 25, [new SellerSort("startNumber", true)], ct);

        Assert.Equal(2, total);
        Assert.Equal("Ben", items[0].FirstName);
        Assert.Equal("Anna", items[1].FirstName);
    }

    [Fact]
    public async Task ExecuteAsync_SortsByArticleCount()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var query = scope.ServiceProvider.GetRequiredService<ISellerListQuery>();
        var dbContext = scope.ServiceProvider.GetRequiredService<BAR.Infrastructure.Persistence.BarDbContext>();
        var ct = TestContext.Current.CancellationToken;
        var marker = Guid.NewGuid().ToString("N")[..8];

        var type = SellerType.Create($"Standard-{Guid.NewGuid():N}", 15m, 0.5m);
        dbContext.SellerTypes.Add(type);
        var anna = Seller.CreateByAdmin("Anna", $"Beispiel-{marker}", null, "76133", "Karlsruhe", "0721 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        var ben = Seller.CreateByAdmin("Ben", $"Muster-{marker}", null, "10115", "Berlin", "030 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        dbContext.Sellers.AddRange(anna, ben);
        await dbContext.SaveChangesAsync(ct);

        dbContext.Articles.Add(BAR.Domain.Articles.Article.Create(anna.Id, 101, "A1", "Brand", "Cat", 1m, null, null, null, DateTime.UtcNow));
        dbContext.Articles.Add(BAR.Domain.Articles.Article.Create(ben.Id, 201, "A2", "Brand", "Cat", 1m, null, null, null, DateTime.UtcNow));
        dbContext.Articles.Add(BAR.Domain.Articles.Article.Create(ben.Id, 202, "A3", "Brand", "Cat", 1m, null, null, null, DateTime.UtcNow));
        await dbContext.SaveChangesAsync(ct);

        var (items, total) = await query.ExecuteAsync(marker, 1, 25, [new SellerSort("articleCount", true)], ct);

        Assert.Equal(2, total);
        Assert.Equal("Ben", items[0].FirstName);
        Assert.Equal(2, items[0].ArticleCount);
        Assert.Equal("Anna", items[1].FirstName);
        Assert.Equal(1, items[1].ArticleCount);
    }
}
