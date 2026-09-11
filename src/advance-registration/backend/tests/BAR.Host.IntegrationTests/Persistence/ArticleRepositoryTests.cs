using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.Anmeldung.Domain.Articles;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class ArticleRepositoryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticleRepositoryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task CreateAsync_WithoutNewBlock_PersistsArticle()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var article = Article.Create(sellerId, 104, "Winterjacke", "Jako-O", "Jacken", 12.50m, null, null, null, Now);

        await repo.CreateAsync(article, newBlock: null, ct);
        var found = await repo.GetByIdAsync(article.Id, ct);

        Assert.NotNull(found);
        Assert.Equal(104, found!.Number);
    }

    [Fact]
    public async Task CreateAsync_WithNewBlock_PersistsBothInOneCall()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var blocks = scope.ServiceProvider.GetRequiredService<INumberBlockRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var newBlock = NumberBlock.Assign(sellerId, 5001, 10, Now);
        var article = Article.Create(sellerId, 5001, "Body", "H&M", "Bodys", 3.00m, null, null, null, Now);

        await repo.CreateAsync(article, newBlock, ct);

        var persistedBlocks = await blocks.GetForSellerAsync(sellerId, ct);
        Assert.Single(persistedBlocks);
        Assert.Equal(5001, persistedBlocks[0].FromNumber);
    }

    [Fact]
    public async Task GetUsedNumbersForSellerAsync_ReturnsOnlyThatSellersNumbers()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var otherSellerId = Guid.NewGuid().ToString("N")[..8];
        await repo.CreateAsync(Article.Create(sellerId, 201, "A", "B", "C", 1m, null, null, null, Now), null, ct);
        await repo.CreateAsync(Article.Create(sellerId, 202, "A", "B", "C", 1m, null, null, null, Now), null, ct);
        await repo.CreateAsync(Article.Create(otherSellerId, 301, "A", "B", "C", 1m, null, null, null, Now), null, ct);

        var used = await repo.GetUsedNumbersForSellerAsync(sellerId, ct);

        Assert.Equal([201, 202], used.OrderBy(n => n));
    }

    [Fact]
    public async Task DeleteAsync_RemovesArticle()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var article = Article.Create(sellerId, 401, "A", "B", "C", 1m, null, null, null, Now);
        await repo.CreateAsync(article, null, ct);

        await repo.DeleteAsync(article, ct);

        Assert.Null(await repo.GetByIdAsync(article.Id, ct));
    }

    // Neu seit dem Modulith-Schnitt: Brand/Category leben in Stammdaten (eigenes
    // Schema) - Anmeldung haelt fuer bestehende Artikel eine eigene Namenskopie
    // und muss sie selbst zaehlen/umbenennen koennen (siehe IArticleRepository).
    [Fact]
    public async Task CountWithBrandNameAsync_CountsOnlyMatchingBrand()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var brand = $"Marke-{Guid.NewGuid():N}";
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        await repo.CreateAsync(Article.Create(sellerId, 601, "A", brand, "C", 1m, null, null, null, Now), null, ct);
        await repo.CreateAsync(Article.Create(sellerId, 602, "A", brand, "C", 1m, null, null, null, Now), null, ct);
        await repo.CreateAsync(Article.Create(sellerId, 603, "A", "Andere Marke", "C", 1m, null, null, null, Now), null, ct);

        var count = await repo.CountWithBrandNameAsync(brand, ct);

        Assert.Equal(2, count);
    }

    [Fact]
    public async Task CountWithCategoryNameAsync_CountsOnlyMatchingCategory()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var category = $"Kategorie-{Guid.NewGuid():N}";
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        await repo.CreateAsync(Article.Create(sellerId, 701, "A", "B", category, 1m, null, null, null, Now), null, ct);
        await repo.CreateAsync(Article.Create(sellerId, 702, "A", "B", "Andere Kategorie", 1m, null, null, null, Now), null, ct);

        var count = await repo.CountWithCategoryNameAsync(category, ct);

        Assert.Equal(1, count);
    }

    [Fact]
    public async Task RenameBrandAsync_UpdatesBrandOnAllMatchingArticles()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var oldName = $"Alt-{Guid.NewGuid():N}";
        var newName = $"Neu-{Guid.NewGuid():N}";
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var article = Article.Create(sellerId, 801, "A", oldName, "C", 1m, null, null, null, Now);
        await repo.CreateAsync(article, null, ct);

        await repo.RenameBrandAsync(oldName, newName, ct);

        var reloaded = await repo.GetByIdAsync(article.Id, ct);
        Assert.Equal(newName, reloaded!.Brand);
    }

    [Fact]
    public async Task RenameCategoryAsync_UpdatesCategoryOnAllMatchingArticles()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var oldName = $"Alt-{Guid.NewGuid():N}";
        var newName = $"Neu-{Guid.NewGuid():N}";
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var article = Article.Create(sellerId, 901, "A", "B", oldName, 1m, null, null, null, Now);
        await repo.CreateAsync(article, null, ct);

        await repo.RenameCategoryAsync(oldName, newName, ct);

        var reloaded = await repo.GetByIdAsync(article.Id, ct);
        Assert.Equal(newName, reloaded!.Category);
    }

    [Fact]
    public async Task GetAllForExportAsync_ReturnsAllPersistedArticles()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var sellerId = Guid.NewGuid().ToString("N")[..8];
        var article = Article.Create(sellerId, 1001, "Exportartikel", "B", "C", 1m, null, null, null, Now);
        await repo.CreateAsync(article, null, ct);

        var all = await repo.GetAllForExportAsync(ct);

        Assert.Contains(all, a => a.Id == article.Id);
    }
}

public class ArticleRepositoryExistsNumberBelowTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticleRepositoryExistsNumberBelowTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task ExistsNumberBelowAsync_NoArticles_ReturnsFalse()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();

        var result = await repo.ExistsNumberBelowAsync(1, TestContext.Current.CancellationToken);

        Assert.False(result);
    }

    [Fact]
    public async Task ExistsNumberBelowAsync_ArticleNumberBelowThreshold_ReturnsTrue()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;

        var article = Article.Create(
            sellerId: Guid.NewGuid().ToString("N")[..8], number: 3000, name: "Testartikel", brand: "Marke",
            category: "Kategorie", price: 10m, size: null, color: null, description: null, nowUtc: DateTime.UtcNow);
        await repo.CreateAsync(article, newBlock: null, ct);

        var result = await repo.ExistsNumberBelowAsync(4000, ct);

        Assert.True(result);
    }

    [Fact]
    public async Task ExistsNumberBelowAsync_ArticleNumberEqualsThreshold_ReturnsFalse()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;

        var article = Article.Create(
            sellerId: Guid.NewGuid().ToString("N")[..8], number: 2000, name: "Testartikel", brand: "Marke",
            category: "Kategorie", price: 10m, size: null, color: null, description: null, nowUtc: DateTime.UtcNow);
        await repo.CreateAsync(article, newBlock: null, ct);

        var result = await repo.ExistsNumberBelowAsync(2000, ct);

        Assert.False(result);
    }

    [Fact]
    public async Task ExistsNumberBelowAsync_ArticleNumberAboveThreshold_ReturnsFalse()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var repo = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;

        var article = Article.Create(
            sellerId: Guid.NewGuid().ToString("N")[..8], number: 2500, name: "Testartikel", brand: "Marke",
            category: "Kategorie", price: 10m, size: null, color: null, description: null, nowUtc: DateTime.UtcNow);
        await repo.CreateAsync(article, newBlock: null, ct);

        var result = await repo.ExistsNumberBelowAsync(1000, ct);

        Assert.False(result);
    }
}
