using Bazaar.Domain.Articles;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class BrandArticleLinkTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    private static async Task SeedAsync(BazaarDbContext dbContext, CancellationToken cancellationToken)
    {
        var now = DateTimeOffset.UtcNow;

        var nike1 = Article.Create(
            "ART00001", 1, "SEL00001", "T-Shirt", "Nike", "Kleidung", 10m,
            null, null, null, now, now);
        var nike2 = Article.Create(
            "ART00002", 2, "SEL00001", "Hose", "Nike", "Kleidung", 20m,
            null, null, null, now, now);
        var adidas = Article.Create(
            "ART00003", 3, "SEL00001", "Schuhe", "Adidas", "Schuhe", 30m,
            null, null, null, now, now);

        await dbContext.Articles.AddRangeAsync([nike1, nike2, adidas], cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
    }

    [Fact]
    public async Task CountByBrandName_ReturnsRealCountOfMatchingArticles()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext, cancellationToken);
        var sut = new BrandArticleLink(dbContext);

        var count = await sut.CountByBrandName("Nike");

        Assert.Equal(2, count);
    }

    [Fact]
    public async Task CountByBrandName_NoMatchingArticles_ReturnsZero()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext, cancellationToken);
        var sut = new BrandArticleLink(dbContext);

        var count = await sut.CountByBrandName("Puma");

        Assert.Equal(0, count);
    }

    [Fact(Skip =
        "ExecuteUpdateAsync is not supported by Microsoft.EntityFrameworkCore.InMemory 10.0.4 " +
        "(confirmed empirically: throws InvalidOperationException at query-compile time). " +
        "RenameArticlesReferencingBrand can only be verified against a real provider " +
        "(Postgres via Npgsql.EntityFrameworkCore.PostgreSQL) — see task-2-report.md.")]
    public async Task RenameArticlesReferencingBrand_UpdatesMatchingArticlesOnly()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext, cancellationToken);
        var sut = new BrandArticleLink(dbContext);

        await sut.RenameArticlesReferencingBrand("Nike", "NikeNew");

        var renamed = await dbContext.Articles.Where(a => a.Brand == "NikeNew").ToListAsync(cancellationToken);
        var untouched = await dbContext.Articles.SingleAsync(a => a.Id == "ART00003", cancellationToken);

        Assert.Equal(2, renamed.Count);
        Assert.Equal("Adidas", untouched.Brand);
    }
}
