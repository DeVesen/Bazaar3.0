using BAR.Domain.Articles;
using BAR.Domain.MasterData;
using BAR.Domain.Ports.Queries;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Persistence;

public class ExportQueryTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ExportQueryTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task ExecuteAsync_ExcludesSellersWithoutArticles()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var query = scope.ServiceProvider.GetRequiredService<IExportQuery>();
        var dbContext = scope.ServiceProvider.GetRequiredService<BAR.Infrastructure.Persistence.BarDbContext>();
        var ct = TestContext.Current.CancellationToken;
        var marker = Guid.NewGuid().ToString("N")[..8];

        var type = SellerType.Create($"Standard-{marker}", 15m, 0.5m);
        dbContext.SellerTypes.Add(type);
        var withArticle = Seller.CreateByAdmin("Anna", $"Beispiel-{marker}", null, "76133", "Karlsruhe", "0721 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        var withoutArticle = Seller.CreateByAdmin("Ben", $"Muster-{marker}", null, "10115", "Berlin", "030 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        dbContext.Sellers.AddRange(withArticle, withoutArticle);
        await dbContext.SaveChangesAsync(ct);
        dbContext.Articles.Add(Article.Create(withArticle.Id, 101, $"Jacke-{marker}", "Nike", "Jacken", 25m, "M", "Blau", null, DateTime.UtcNow));
        await dbContext.SaveChangesAsync(ct);

        var result = await query.ExecuteAsync(false, false, ct);

        Assert.Contains(result.Sellers, s => s.Id == withArticle.Id);
        Assert.DoesNotContain(result.Sellers, s => s.Id == withoutArticle.Id);
    }

    [Fact]
    public async Task ExecuteAsync_MapsArticlesAndSellerTypeName()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var query = scope.ServiceProvider.GetRequiredService<IExportQuery>();
        var dbContext = scope.ServiceProvider.GetRequiredService<BAR.Infrastructure.Persistence.BarDbContext>();
        var ct = TestContext.Current.CancellationToken;
        var marker = Guid.NewGuid().ToString("N")[..8];

        var type = SellerType.Create($"Premium-{marker}", 20m, 1m);
        dbContext.SellerTypes.Add(type);
        var seller = Seller.CreateByAdmin("Clara", $"Beispiel-{marker}", "Hauptstr. 1", "76133", "Karlsruhe", "0721 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        dbContext.Sellers.Add(seller);
        await dbContext.SaveChangesAsync(ct);
        dbContext.Articles.Add(Article.Create(seller.Id, 201, $"Hose-{marker}", "Adidas", "Hosen", 12.5m, "L", "Schwarz", "kaum getragen", DateTime.UtcNow));
        await dbContext.SaveChangesAsync(ct);

        var result = await query.ExecuteAsync(false, false, ct);
        var exported = result.Sellers.Single(s => s.Id == seller.Id);

        Assert.Equal($"Premium-{marker}", exported.SellerType);
        Assert.Equal("Hauptstr. 1", exported.Address);
        var article = exported.Articles.Single();
        Assert.Equal(201, article.Number);
        Assert.Equal("Adidas", article.Brand);
        Assert.Equal(12.5m, article.Price);
    }

    [Fact]
    public async Task ExecuteAsync_BrandsAndCategoriesEmptyArraysWhenNotRequested()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var query = scope.ServiceProvider.GetRequiredService<IExportQuery>();
        var dbContext = scope.ServiceProvider.GetRequiredService<BAR.Infrastructure.Persistence.BarDbContext>();
        var ct = TestContext.Current.CancellationToken;
        var marker = Guid.NewGuid().ToString("N")[..8];
        dbContext.Brands.Add(Brand.Create($"Puma-{marker}", true));
        dbContext.Categories.Add(Category.Create($"Schuhe-{marker}", true));
        await dbContext.SaveChangesAsync(ct);

        var withoutFlags = await query.ExecuteAsync(false, false, ct);
        var withFlags = await query.ExecuteAsync(true, true, ct);

        Assert.Empty(withoutFlags.Brands);
        Assert.Empty(withoutFlags.Categories);
        Assert.Contains($"Puma-{marker}", withFlags.Brands);
        Assert.Contains($"Schuhe-{marker}", withFlags.Categories);
    }
}
