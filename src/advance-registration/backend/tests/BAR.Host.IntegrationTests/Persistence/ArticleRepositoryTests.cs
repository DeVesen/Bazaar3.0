using BAR.Domain.Articles;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
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
            sellerId: Guid.NewGuid().ToString("N")[..8], number: 5, name: "Testartikel", brand: "Marke",
            category: "Kategorie", price: 10m, size: null, color: null, description: null, nowUtc: DateTime.UtcNow);
        await repo.CreateAsync(article, newBlock: null, ct);

        var result = await repo.ExistsNumberBelowAsync(10, ct);

        Assert.True(result);
    }
}
