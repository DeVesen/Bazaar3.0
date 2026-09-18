using Bazaar.Domain.Articles;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class ArticleCountBySellerQueryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    [Fact]
    public async Task CountBySellerId_ReturnsCountScopedToSeller()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        var now = DateTimeOffset.UtcNow;

        var sellerOneArticle1 = Article.Create(
            "ART00001", 1, "SEL00001", "T-Shirt", "Nike", "Kleidung", 10m,
            null, null, null, now, now);
        var sellerOneArticle2 = Article.Create(
            "ART00002", 2, "SEL00001", "Hose", "Adidas", "Kleidung", 20m,
            null, null, null, now, now);
        var sellerTwoArticle = Article.Create(
            "ART00003", 3, "SEL00002", "Schuhe", "Nike", "Schuhe", 30m,
            null, null, null, now, now);

        await dbContext.Articles.AddRangeAsync(
            [sellerOneArticle1, sellerOneArticle2, sellerTwoArticle], cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new ArticleCountBySellerQuery(dbContext);

        Assert.Equal(2, await sut.CountBySellerId("SEL00001"));
        Assert.Equal(1, await sut.CountBySellerId("SEL00002"));
        Assert.Equal(0, await sut.CountBySellerId("SEL00003"));
    }
}
