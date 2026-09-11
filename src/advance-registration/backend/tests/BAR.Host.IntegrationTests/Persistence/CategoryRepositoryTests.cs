using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.Stammdaten.Domain.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class CategoryRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public CategoryRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task AddAsync_ThenGetAll_ContainsCategory()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ICategoryRepository>();
        var ct = TestContext.Current.CancellationToken;
        var category = Category.Create($"Jako-O-{Guid.NewGuid():N}", original: true);

        await repo.AddAsync(category, ct);
        var all = await repo.GetAllAsync(ct);

        Assert.Contains(all, c => c.Id == category.Id);
    }

    [Fact]
    public async Task ExistsByNameCaseInsensitiveAsync_DifferentCasingAndWhitespace_ReturnsTrue()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ICategoryRepository>();
        var ct = TestContext.Current.CancellationToken;
        var unique = Guid.NewGuid().ToString("N")[..8];
        await repo.AddAsync(Category.Create($"nike-{unique}", original: false), ct);

        var exists = await repo.ExistsByNameCaseInsensitiveAsync($"  NIKE-{unique} ".Trim().ToUpperInvariant(), excludeId: null, ct);

        Assert.True(exists);
    }

    [Fact]
    public async Task ExistsByNameCaseInsensitiveAsync_ExcludeOwnId_ReturnsFalse()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ICategoryRepository>();
        var ct = TestContext.Current.CancellationToken;
        var unique = Guid.NewGuid().ToString("N")[..8];
        var category = Category.Create($"Puma-{unique}", original: false);
        await repo.AddAsync(category, ct);

        var exists = await repo.ExistsByNameCaseInsensitiveAsync($"puma-{unique}", excludeId: category.Id, ct);

        Assert.False(exists);
    }

    // UpdateAsync hat kein renameArticlesFrom mehr - siehe BrandRepositoryTests
    // fuer die Begruendung; identisches Muster fuer Kategorien.
    [Fact]
    public async Task UpdateAsync_PersistsNewNameAndOriginalFlag()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var categories = scope.ServiceProvider.GetRequiredService<ICategoryRepository>();
        var ct = TestContext.Current.CancellationToken;
        var category = Category.Create($"Alt-{Guid.NewGuid():N}", original: false);
        await categories.AddAsync(category, ct);

        category.Rename("Neu", original: true);
        await categories.UpdateAsync(category, ct);

        var reloaded = await categories.GetByIdAsync(category.Id, ct);
        Assert.Equal("Neu", reloaded!.Name);
        Assert.True(reloaded.Original);
    }

    [Fact]
    public async Task DeleteAsync_RemovesCategory()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<ICategoryRepository>();
        var ct = TestContext.Current.CancellationToken;
        var category = Category.Create($"Weg-{Guid.NewGuid():N}", original: false);
        await repo.AddAsync(category, ct);

        await repo.DeleteAsync(category, ct);

        Assert.Null(await repo.GetByIdAsync(category.Id, ct));
    }
}
