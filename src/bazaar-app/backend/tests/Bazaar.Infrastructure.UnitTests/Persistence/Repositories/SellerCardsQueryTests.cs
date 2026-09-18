using Bazaar.Domain.Articles;
using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class SellerCardsQueryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    private static async Task SeedAsync(BazaarDbContext dbContext)
    {
        var sellerType = SellerType.Create("SLT00001", "Privat", 10m, 0.5m);
        await dbContext.SellerTypes.AddAsync(sellerType);

        var open = Seller.Create(
            "SEL00001", "Anna", "Meier", null, "76133", "Karlsruhe", null,
            "anna@example.org", "SLT00001", 10m, 0.5m);

        var settled = Seller.Create(
            "SEL00002", "Max", "Mustermann", null, "76133", "Karlsruhe", null,
            "max@example.org", "SLT00001", 10m, 0.5m);
        settled.Settle(42m, DateTimeOffset.UtcNow);

        var freiburger = Seller.Create(
            "SEL00003", "Jonas", "Fischer", null, "79098", "Freiburg", null,
            "jonas@example.org", "SLT00001", 10m, 0.5m);

        await dbContext.Sellers.AddAsync(open);
        await dbContext.Sellers.AddAsync(settled);
        await dbContext.Sellers.AddAsync(freiburger);

        await dbContext.SaveChangesAsync();
    }

    [Fact]
    public async Task GetCards_NoStatusFilter_ReturnsAllSellers()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerCardsQuery(dbContext);

        var page = await sut.GetCards(null, null, null, 1, 60);

        Assert.Equal(3, page.TotalCount);
    }

    [Fact]
    public async Task GetCards_StatusSettled_ReturnsOnlySellersWithSettledAt()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerCardsQuery(dbContext);

        var page = await sut.GetCards(null, "settled", null, 1, 60);

        var item = Assert.Single(page.Items);
        Assert.Equal("SEL00002", item.Id);
        Assert.Equal("settled", item.Status);
    }

    [Fact]
    public async Task GetCards_StatusOpen_ReturnsOnlyNonSettledSellers()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerCardsQuery(dbContext);

        var page = await sut.GetCards(null, "open", null, 1, 60);

        Assert.Equal(2, page.TotalCount);
        Assert.DoesNotContain(page.Items, i => i.Id == "SEL00002");
    }

    [Fact]
    public async Task GetCards_StatusSelling_WithNoReleasedArticlesAnywhere_ReturnsEmptySet()
    {
        // None of the seeded sellers have any articles, so no one can have a
        // released article — "selling" must be empty while "open" still
        // contains both non-settled sellers (these sets now genuinely differ,
        // unlike the Round-14 placeholder where they were identical).
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerCardsQuery(dbContext);

        var openPage = await sut.GetCards(null, "open", null, 1, 60);
        var sellingPage = await sut.GetCards(null, "selling", null, 1, 60);

        Assert.Equal(2, openPage.TotalCount);
        Assert.Empty(sellingPage.Items);
    }

    [Fact]
    public async Task GetCards_SellerWithNoArticles_YieldsAllZeroCountersAndSums()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerCardsQuery(dbContext);

        var page = await sut.GetCards(null, null, null, 1, 60);

        var item = page.Items.Single(i => i.Id == "SEL00001");
        Assert.Equal(0, item.ArticleCount);
        Assert.Equal(0, item.ReleasedCount);
        Assert.Equal(0, item.SoldCount);
        Assert.Equal(0, item.ReturnedCount);
        Assert.Equal(0m, item.AcceptedValue);
        Assert.Equal(0m, item.OpenValue);
        Assert.Equal(0m, item.Revenue);
        Assert.Equal("open", item.Status);
    }

    [Fact]
    public async Task GetCards_SellerWithArticlesInVariousStates_ComputesRealCountersAndSums()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);

        var now = DateTimeOffset.UtcNow;

        // Registered only (not released) — counts toward ArticleCount only.
        var registered = Article.Create(
            "ART00001", 1, "SEL00001", "T-Shirt", "Nike", "Kleidung", 10m,
            null, null, null, now, now);

        // Released, still open (not sold, not returned) — AcceptedValue + OpenValue.
        var released = Article.Create(
            "ART00002", 2, "SEL00001", "Hose", "Adidas", "Kleidung", 20m,
            null, null, null, now, now);
        released.SetTimestamps(now, null, null, false, now);

        // Released and sold — AcceptedValue + Revenue, not OpenValue.
        var sold = Article.Create(
            "ART00003", 3, "SEL00001", "Jacke", "Puma", "Kleidung", 30m,
            null, null, null, now, now);
        sold.SetTimestamps(now, now, null, false, now);

        // Released and returned — AcceptedValue only, not OpenValue/Revenue.
        var returned = Article.Create(
            "ART00004", 4, "SEL00001", "Schuhe", "Nike", "Schuhe", 40m,
            null, null, null, now, now);
        returned.SetTimestamps(now, null, now, false, now);

        await dbContext.Articles.AddRangeAsync([registered, released, sold, returned], cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new SellerCardsQuery(dbContext);
        var page = await sut.GetCards(null, null, null, 1, 60);

        var item = page.Items.Single(i => i.Id == "SEL00001");
        Assert.Equal(4, item.ArticleCount);
        Assert.Equal(3, item.ReleasedCount);
        Assert.Equal(1, item.SoldCount);
        Assert.Equal(1, item.ReturnedCount);
        Assert.Equal(90m, item.AcceptedValue); // released + sold + returned
        Assert.Equal(20m, item.OpenValue); // released only
        Assert.Equal(30m, item.Revenue); // sold only
        Assert.Equal("selling", item.Status);
    }

    [Fact]
    public async Task GetCards_SellerWithReleasedNonSoldNonSettledArticle_StatusIsSellingNotOpen()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);

        var now = DateTimeOffset.UtcNow;
        var released = Article.Create(
            "ART00005", 5, "SEL00001", "Mütze", "Nike", "Accessoires", 5m,
            null, null, null, now, now);
        released.SetTimestamps(now, null, null, false, now);
        await dbContext.Articles.AddAsync(released, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new SellerCardsQuery(dbContext);
        var page = await sut.GetCards(null, null, null, 1, 60);

        var item = page.Items.Single(i => i.Id == "SEL00001");
        Assert.Equal("selling", item.Status);
    }

    [Fact]
    public async Task GetCards_StatusSellingFilter_ReturnsOnlySellersWithReleasedUnsettledArticles()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);

        var now = DateTimeOffset.UtcNow;
        var released = Article.Create(
            "ART00006", 6, "SEL00001", "Mütze", "Nike", "Accessoires", 5m,
            null, null, null, now, now);
        released.SetTimestamps(now, null, null, false, now);
        await dbContext.Articles.AddAsync(released, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new SellerCardsQuery(dbContext);
        var sellingPage = await sut.GetCards(null, "selling", null, 1, 60);
        var openPage = await sut.GetCards(null, "open", null, 1, 60);

        var sellingItem = Assert.Single(sellingPage.Items);
        Assert.Equal("SEL00001", sellingItem.Id);

        // SEL00003 has no articles at all, so it must land in "open", not "selling".
        Assert.DoesNotContain(sellingPage.Items, i => i.Id == "SEL00003");
        Assert.Contains(openPage.Items, i => i.Id == "SEL00003");
        Assert.DoesNotContain(openPage.Items, i => i.Id == "SEL00001");
    }

    [Fact]
    public async Task GetCards_QCityOnlyToken_MatchesSellerByCity()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerCardsQuery(dbContext);

        var page = await sut.GetCards("Freiburg", null, null, 1, 60);

        var item = Assert.Single(page.Items);
        Assert.Equal("SEL00003", item.Id);
    }

    [Fact]
    public async Task GetCards_PageSizeAboveCap_IsClampedTo200()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerCardsQuery(dbContext);

        var page = await sut.GetCards(null, null, null, 1, 100_000);

        Assert.Equal(200, page.PageSize);
    }
}
