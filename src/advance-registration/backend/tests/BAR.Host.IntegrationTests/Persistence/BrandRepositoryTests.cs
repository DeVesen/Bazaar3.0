using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
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

    [Fact]
    public async Task UpdateAsync_RenameWithCascade_UpdatesArticleBrandField()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var brands = scope.ServiceProvider.GetRequiredService<IBrandRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var oldName = $"Alt-{Guid.NewGuid():N}";
        var brand = Brand.Create(oldName, original: false);
        await brands.AddAsync(brand, ct);
        var article = BAR.Domain.Articles.Article.Create(sellerId, 501, "Jacke", oldName, "Jacken", 5m, null, null, null, DateTime.UtcNow);
        await articles.CreateAsync(article, null, ct);

        brand.Rename("Neu", original: true);
        await brands.UpdateAsync(brand, renameArticlesFrom: oldName, ct);

        var updatedArticle = await articles.GetByIdAsync(article.Id, ct);
        Assert.Equal("Neu", updatedArticle!.Brand);
    }

    [Fact]
    public async Task CountArticlesWithNameAsync_NoMatches_ReturnsZero()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IBrandRepository>();

        var count = await repo.CountArticlesWithNameAsync($"unbenutzt-{Guid.NewGuid():N}", TestContext.Current.CancellationToken);

        Assert.Equal(0, count);
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
