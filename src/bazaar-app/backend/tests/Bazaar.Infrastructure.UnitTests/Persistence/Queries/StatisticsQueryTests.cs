using Bazaar.Domain.Articles;
using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Queries;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Queries;

public class StatisticsQueryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    [Fact]
    public async Task Get_EmptyDatabase_YieldsAllZeroCountersAndEmptyLeaderboard()
    {
        await using var dbContext = CreateContext();
        var sut = new StatisticsQuery(dbContext);

        var result = await sut.Get(null);

        Assert.Equal(0, result.TotalCount);
        Assert.Equal(0, result.AcceptedCount);
        Assert.Equal(0, result.SellingCount);
        Assert.Equal(0, result.SoldCount);
        Assert.Equal(0, result.ReturnedCount);
        Assert.Equal(0m, result.AcceptedValue);
        Assert.Equal(0m, result.ReturnedValue);
        Assert.Equal(0m, result.OpenValue);
        Assert.Equal(0m, result.GrossIncome);
        Assert.Equal(0m, result.GrossIncomeManual);
        Assert.Equal(0m, result.Commission);
        Assert.Equal(0m, result.Fees);
        Assert.Equal(0m, result.PayoutExpected);
        Assert.Equal(0m, result.PayoutSettled);
        Assert.Empty(result.Leaderboard);
    }

    [Fact]
    public async Task Get_TwoSellersSameRateAtRoundingBoundary_SumsPerSellerRoundedCommission()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();

        var sellerType = SellerType.Create("SLT00001", "Privat", 10m, 0.5m);
        await dbContext.SellerTypes.AddAsync(sellerType, cancellationToken);

        // Both sellers share the same 10% commission rate and the same
        // revenue (25.25) — chosen so that per-seller kaufmännische Rundung
        // (25.25 * 10% = 2.525 -> AwayFromZero -> 2.53 each, summing to 5.06)
        // genuinely differs from rounding once over the combined revenue
        // (50.50 * 10% = 5.05 exactly, no rounding needed). If the query ever
        // regressed to rounding a single blended total instead of summing
        // per-seller-rounded commissions, this test would catch the drift.
        var sellerA = Seller.Create(
            "SEL00001", "Anna", "Meier", null, null, "Karlsruhe", null,
            "anna@example.org", "SLT00001", 10m, 0.5m);
        var sellerB = Seller.Create(
            "SEL00002", "Bea", "Schulz", null, null, "Karlsruhe", null,
            "bea@example.org", "SLT00001", 10m, 0.5m);
        await dbContext.Sellers.AddRangeAsync([sellerA, sellerB], cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var articleA = Article.Create("ART00001", 1, "SEL00001", "Kleid", "Nike", "Kleidung", 25.25m, null, null, null, now, now);
        articleA.SetTimestamps(now, now, null, false, now);
        var articleB = Article.Create("ART00002", 2, "SEL00002", "Hose", "Adidas", "Kleidung", 25.25m, null, null, null, now, now);
        articleB.SetTimestamps(now, now, null, false, now);
        await dbContext.Articles.AddRangeAsync([articleA, articleB], cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new StatisticsQuery(dbContext);

        var result = await sut.Get(null);

        Assert.Equal(5.06m, result.Commission);
        Assert.NotEqual(5.05m, result.Commission);
    }

    [Fact]
    public async Task Get_NoSoldManuallyArticles_GrossIncomeManualIsZero()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();

        var sellerType = SellerType.Create("SLT00001", "Privat", 10m, 0.5m);
        await dbContext.SellerTypes.AddAsync(sellerType, cancellationToken);
        var seller = Seller.Create(
            "SEL00001", "Anna", "Meier", null, null, "Karlsruhe", null,
            "anna@example.org", "SLT00001", 10m, 0.5m);
        await dbContext.Sellers.AddAsync(seller, cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var article = Article.Create("ART00001", 1, "SEL00001", "Kleid", "Nike", "Kleidung", 20m, null, null, null, now, now);
        article.SetTimestamps(now, now, null, manually: false, now);
        await dbContext.Articles.AddAsync(article, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new StatisticsQuery(dbContext);

        var result = await sut.Get(null);

        Assert.Equal(20m, result.GrossIncome);
        Assert.Equal(0m, result.GrossIncomeManual);
    }

    [Fact]
    public async Task Get_SellerTypeIdFilter_FiltersOnlyLeaderboardNotKpis()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();

        var typeA = SellerType.Create("SLT00001", "Privat", 10m, 0.5m);
        var typeB = SellerType.Create("SLT00002", "Verein", 5m, 0.25m);
        await dbContext.SellerTypes.AddRangeAsync([typeA, typeB], cancellationToken);

        var sellerA = Seller.Create(
            "SEL00001", "Anna", "Meier", null, null, "Karlsruhe", null,
            "anna@example.org", "SLT00001", 10m, 0.5m);
        var sellerB = Seller.Create(
            "SEL00002", "Bea", "Schulz", null, null, "Karlsruhe", null,
            "bea@example.org", "SLT00002", 5m, 0.25m);
        await dbContext.Sellers.AddRangeAsync([sellerA, sellerB], cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var articleA = Article.Create("ART00001", 1, "SEL00001", "Kleid", "Nike", "Kleidung", 20m, null, null, null, now, now);
        articleA.SetTimestamps(now, now, null, false, now);
        var articleB = Article.Create("ART00002", 2, "SEL00002", "Hose", "Adidas", "Kleidung", 30m, null, null, null, now, now);
        articleB.SetTimestamps(now, now, null, false, now);
        await dbContext.Articles.AddRangeAsync([articleA, articleB], cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new StatisticsQuery(dbContext);

        var unfiltered = await sut.Get(null);
        var filtered = await sut.Get("SLT00001");

        Assert.Equal(2, unfiltered.Leaderboard.Count);
        Assert.Single(filtered.Leaderboard);
        Assert.Equal("SEL00001", filtered.Leaderboard[0].SellerId);

        Assert.Equal(unfiltered.TotalCount, filtered.TotalCount);
        Assert.Equal(unfiltered.AcceptedCount, filtered.AcceptedCount);
        Assert.Equal(unfiltered.SoldCount, filtered.SoldCount);
        Assert.Equal(unfiltered.GrossIncome, filtered.GrossIncome);
        Assert.Equal(unfiltered.Commission, filtered.Commission);
        Assert.Equal(unfiltered.Fees, filtered.Fees);
        Assert.Equal(unfiltered.PayoutExpected, filtered.PayoutExpected);
        Assert.Equal(unfiltered.PayoutSettled, filtered.PayoutSettled);
    }

    [Fact]
    public async Task Get_SettledAndUnsettledSellers_ComputesPayoutSettledAndFeesAndPayoutExpected()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();

        var sellerType = SellerType.Create("SLT00001", "Privat", 10m, 0.5m);
        await dbContext.SellerTypes.AddAsync(sellerType, cancellationToken);

        var settledSeller = Seller.Create(
            "SEL00001", "Anna", "Meier", null, null, "Karlsruhe", null,
            "anna@example.org", "SLT00001", 10m, 0.5m);
        var unsettledSeller = Seller.Create(
            "SEL00002", "Bea", "Schulz", null, null, "Karlsruhe", null,
            "bea@example.org", "SLT00001", 10m, 0.5m);
        settledSeller.AddIntakeFeePaid(2.50m);
        unsettledSeller.AddIntakeFeePaid(1.50m);
        settledSeller.Settle(90m, DateTimeOffset.UtcNow);
        await dbContext.Sellers.AddRangeAsync([settledSeller, unsettledSeller], cancellationToken);

        var now = DateTimeOffset.UtcNow;
        var articleA = Article.Create("ART00001", 1, "SEL00001", "Kleid", "Nike", "Kleidung", 100m, null, null, null, now, now);
        articleA.SetTimestamps(now, now, null, false, now);
        var articleB = Article.Create("ART00002", 2, "SEL00002", "Hose", "Adidas", "Kleidung", 50m, null, null, null, now, now);
        articleB.SetTimestamps(now, now, null, false, now);
        await dbContext.Articles.AddRangeAsync([articleA, articleB], cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new StatisticsQuery(dbContext);

        var result = await sut.Get(null);

        // Commission: 10% of 100 = 10.00, 10% of 50 = 5.00 -> total 15.00.
        Assert.Equal(15.00m, result.Commission);
        Assert.Equal(4.00m, result.Fees);
        Assert.Equal(90m, result.PayoutSettled);
        // GrossIncome 150 - EarningsTotal(15 commission + 4 fees = 19) = 131.
        Assert.Equal(131m, result.PayoutExpected);
    }
}
