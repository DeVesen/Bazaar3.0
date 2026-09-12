using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.MasterData.Domain.Catalog;
using BAR.Modules.MasterData.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class BrandRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public BrandRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task AddAsync_ThenGetAll_ContainsBrand()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var ct = TestContext.Current.CancellationToken;
        var brand = Brand.Create($"Jako-O-{Guid.NewGuid():N}", original: true);

        await repo.AddAsync(brand, ct);
        var all = await repo.GetAllAsync(ct);

        Assert.Contains(all, b => b.Id == brand.Id);
    }

    [Fact]
    public async Task ExistsByNameCaseInsensitiveAsync_DifferentCasingAndWhitespace_ReturnsTrue()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var ct = TestContext.Current.CancellationToken;
        var unique = Guid.NewGuid().ToString("N")[..8];
        await repo.AddAsync(Brand.Create($"nike-{unique}", original: false), ct);

        var exists = await repo.ExistsByNameCaseInsensitiveAsync($"  NIKE-{unique} ".Trim().ToUpperInvariant(), excludeId: null, ct);

        Assert.True(exists);
    }

    [Fact]
    public async Task ExistsByNameCaseInsensitiveAsync_ExcludeOwnId_ReturnsFalse()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var ct = TestContext.Current.CancellationToken;
        var unique = Guid.NewGuid().ToString("N")[..8];
        var brand = Brand.Create($"Puma-{unique}", original: false);
        await repo.AddAsync(brand, ct);

        var exists = await repo.ExistsByNameCaseInsensitiveAsync($"puma-{unique}", excludeId: brand.Id, ct);

        Assert.False(exists);
    }

    // UpdateAsync no longer has renameArticlesFrom - since the modulith split,
    // Brand lives in a different schema than Article, so a direct cascade
    // write is no longer possible. Rename instead raises BrandRenamed
    // (MasterDataDbContext.SaveChangesAsync dispatches it); coverage for the
    // cascade effect itself lives in
    // BAR.Application.UnitTests.Registration.EventHandlers.BrandRenamedHandlerTests
    // (mocks IArticleRepository - cheaper than a test spanning two real
    // DbContexts + dispatcher) and in ArticleRepositoryTests.RenameBrandAsync*.
    [Fact]
    public async Task UpdateAsync_PersistsNewNameAndOriginalFlag()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var brands = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var ct = TestContext.Current.CancellationToken;
        var brand = Brand.Create($"Alt-{Guid.NewGuid():N}", original: false);
        await brands.AddAsync(brand, ct);

        brand.Rename("Neu", original: true);
        await brands.UpdateAsync(brand, ct);

        var reloaded = await brands.GetByIdAsync(brand.Id, ct);
        Assert.Equal("Neu", reloaded!.Name);
        Assert.True(reloaded.Original);
    }

    [Fact]
    public async Task DeleteAsync_RemovesBrand()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var ct = TestContext.Current.CancellationToken;
        var brand = Brand.Create($"Weg-{Guid.NewGuid():N}", original: false);
        await repo.AddAsync(brand, ct);

        await repo.DeleteAsync(brand, ct);

        Assert.Null(await repo.GetByIdAsync(brand.Id, ct));
    }
}
