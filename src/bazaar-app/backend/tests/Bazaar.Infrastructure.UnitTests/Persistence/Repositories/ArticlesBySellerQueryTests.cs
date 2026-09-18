using Bazaar.Domain.Articles;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class ArticlesBySellerQueryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    [Fact]
    public async Task GetBySellerId_ReturnsOnlyArticlesForThatSeller()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        var now = DateTimeOffset.UtcNow;

        var sellerOneArticle = Article.Create(
            "ART00001", 1, "SEL00001", "T-Shirt", "Nike", "Kleidung", 10m,
            null, null, null, now, now);
        var sellerTwoArticle = Article.Create(
            "ART00002", 2, "SEL00002", "Hose", "Adidas", "Kleidung", 20m,
            null, null, null, now, now);

        await dbContext.Articles.AddRangeAsync([sellerOneArticle, sellerTwoArticle], cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new ArticlesBySellerQuery(dbContext);

        var result = await sut.GetBySellerId("SEL00001");

        var item = Assert.Single(result);
        Assert.Equal("ART00001", item.Id);
        Assert.Equal("registered", item.Status);
    }

    [Fact]
    public async Task GetBySellerId_ArticleWithOnlyReleasedAt_HasSellingStatus()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        var now = DateTimeOffset.UtcNow;

        var article = Article.Create(
            "ART00003", 3, "SEL00001", "Mütze", "Nike", "Accessoires", 5m,
            null, null, null, now, now);
        article.SetTimestamps(now, null, null, false, now);

        await dbContext.Articles.AddAsync(article, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new ArticlesBySellerQuery(dbContext);

        var result = await sut.GetBySellerId("SEL00001");

        var item = Assert.Single(result);
        Assert.Equal("selling", item.Status);
    }

    [Fact]
    public async Task GetBySellerId_NoArticlesForSeller_ReturnsEmptyList()
    {
        await using var dbContext = CreateContext();
        var sut = new ArticlesBySellerQuery(dbContext);

        var result = await sut.GetBySellerId("SEL00999");

        Assert.Empty(result);
    }
}
