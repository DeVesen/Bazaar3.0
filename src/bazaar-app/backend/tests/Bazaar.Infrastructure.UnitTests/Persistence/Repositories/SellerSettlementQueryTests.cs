using Bazaar.Domain.Articles;
using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class SellerSettlementQueryTests
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

        var seller = Seller.Create(
            "SEL00001", "Anna", "Meier", "Musterstr. 1", "76133", "Karlsruhe", null,
            "anna@example.org", "SLT00001", 12.5m, 0.5m);

        var noArticlesSeller = Seller.Create(
            "SEL00002", "Max", "Mustermann", null, "76133", "Karlsruhe", null,
            "max@example.org", "SLT00001", 10m, 0.5m);

        await dbContext.Sellers.AddAsync(seller);
        await dbContext.Sellers.AddAsync(noArticlesSeller);
        await dbContext.SaveChangesAsync();
    }

    [Fact]
    public async Task GetSettlement_UnknownSellerId_ReturnsNull()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSettlementQuery(dbContext);

        var result = await sut.GetSettlement("SEL99999");

        Assert.Null(result);
    }

    [Fact]
    public async Task GetSettlement_SellerWithNoArticles_YieldsAllZeroCountersAndZeroRevenue()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSettlementQuery(dbContext);

        var result = await sut.GetSettlement("SEL00002");

        Assert.NotNull(result);
        Assert.Equal(0, result!.OpenCount);
        Assert.Equal(0, result.SoldCount);
        Assert.Equal(0, result.ReturnedCount);
        Assert.Equal(0m, result.Revenue);
        Assert.Equal(0, result.NotDeliveredCount);
    }

    [Fact]
    public async Task GetSettlement_SellerWithMixedArticles_ComputesRealCountersAndRevenue()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);

        var now = DateTimeOffset.UtcNow;

        // Registered only (not released) — NotDeliveredCount only.
        var registered = Article.Create(
            "ART00001", 1, "SEL00001", "T-Shirt", "Nike", "Kleidung", 10m,
            null, null, null, now, now);

        // Released, still open (Selling status) — OpenCount only.
        var selling = Article.Create(
            "ART00002", 2, "SEL00001", "Hose", "Adidas", "Kleidung", 20m,
            null, null, null, now, now);
        selling.SetTimestamps(now, null, null, false, now);

        // Released and sold — SoldCount + Revenue.
        var sold = Article.Create(
            "ART00003", 3, "SEL00001", "Jacke", "Puma", "Kleidung", 30m,
            null, null, null, now, now);
        sold.SetTimestamps(now, now, null, false, now);

        // Released and returned — ReturnedCount only.
        var returned = Article.Create(
            "ART00004", 4, "SEL00001", "Schuhe", "Nike", "Schuhe", 40m,
            null, null, null, now, now);
        returned.SetTimestamps(now, null, now, false, now);

        await dbContext.Articles.AddRangeAsync([registered, selling, sold, returned], cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new SellerSettlementQuery(dbContext);
        var result = await sut.GetSettlement("SEL00001");

        Assert.NotNull(result);
        Assert.Equal(1, result!.OpenCount);
        Assert.Equal(1, result.SoldCount);
        Assert.Equal(1, result.ReturnedCount);
        Assert.Equal(30m, result.Revenue);
        Assert.Equal(1, result.NotDeliveredCount);
    }

    [Fact]
    public async Task GetSettlement_MapsSellerIdentityAndSettlementFieldsFromSellerEntity()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSettlementQuery(dbContext);

        var result = await sut.GetSettlement("SEL00001");

        Assert.NotNull(result);
        Assert.Equal("SEL00001", result!.SellerId);
        Assert.Equal("Anna", result.FirstName);
        Assert.Equal("Meier", result.LastName);
        Assert.Equal("Musterstr. 1", result.Address);
        Assert.Equal("76133", result.PostalCode);
        Assert.Equal("Karlsruhe", result.City);
        Assert.Equal(12.5m, result.CommissionRate);
        Assert.Equal(0m, result.IntakeFeePaid);
        Assert.Null(result.SettledAt);
        Assert.Null(result.PayoutAmount);
    }

    [Fact]
    public async Task GetSettlement_SettledSeller_MapsSettledAtAndPayoutAmount()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);

        var seller = await dbContext.Sellers.SingleAsync(s => s.Id == "SEL00001", cancellationToken);
        var settledAt = DateTimeOffset.UtcNow;
        seller.Settle(99.5m, settledAt);
        seller.AddIntakeFeePaid(5m);
        await dbContext.SaveChangesAsync(cancellationToken);

        var sut = new SellerSettlementQuery(dbContext);
        var result = await sut.GetSettlement("SEL00001");

        Assert.NotNull(result);
        Assert.Equal(settledAt, result!.SettledAt);
        Assert.Equal(99.5m, result.PayoutAmount);
        Assert.Equal(5m, result.IntakeFeePaid);
    }
}
