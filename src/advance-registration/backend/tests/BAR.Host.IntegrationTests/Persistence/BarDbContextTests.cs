using System.Net;
using BAR.Host.IntegrationTests.Features.Public;
using BAR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class BarDbContextTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public BarDbContextTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task DbContext_AfterMigration_ExposesAllDbSets()
    {
        _ = _factory.Server; // erzwingt Host-Start inkl. Migration
        using var scope = _factory.Services.CreateScope();
        var db = scope.ServiceProvider.GetRequiredService<BarDbContext>();

        Assert.Single(await db.Sellers.ToListAsync(TestContext.Current.CancellationToken)); // Seed: Admin
        Assert.Empty(await db.RefreshTokens.ToListAsync(TestContext.Current.CancellationToken));
        Assert.Single(await db.SellerTypes.ToListAsync(TestContext.Current.CancellationToken)); // Seed
        Assert.Single(await db.Settings.ToListAsync(TestContext.Current.CancellationToken)); // Seed
        Assert.Empty(await db.NumberBlocks.ToListAsync(TestContext.Current.CancellationToken));
        Assert.Empty(await db.Articles.ToListAsync(TestContext.Current.CancellationToken));
        Assert.Empty(await db.Brands.ToListAsync(TestContext.Current.CancellationToken));
        Assert.Empty(await db.Categories.ToListAsync(TestContext.Current.CancellationToken));
    }
}
