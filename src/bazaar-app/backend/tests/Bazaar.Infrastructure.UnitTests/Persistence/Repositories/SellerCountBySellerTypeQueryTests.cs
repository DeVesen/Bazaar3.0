using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class SellerCountBySellerTypeQueryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    [Fact]
    public async Task CountBySellerTypeId_TwoSellersOfType_ReturnsTwo()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        var sellerType = SellerType.Create("SLT00001", "Privat", 10m, 0.5m);
        await dbContext.SellerTypes.AddAsync(sellerType, cancellationToken);
        await dbContext.Sellers.AddAsync(Seller.Create(
            "SEL00001", "Anna", "Meier", null, "76133", "Karlsruhe", null,
            "anna@example.org", "SLT00001", 10m, 0.5m), cancellationToken);
        await dbContext.Sellers.AddAsync(Seller.Create(
            "SEL00002", "Max", "Mustermann", null, "76133", "Karlsruhe", null,
            "max@example.org", "SLT00001", 10m, 0.5m), cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        var sut = new SellerCountBySellerTypeQuery(dbContext);

        var count = await sut.CountBySellerTypeId("SLT00001");

        Assert.Equal(2, count);
    }

    [Fact]
    public async Task CountBySellerTypeId_NoSellerOfType_ReturnsZero()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        var sellerType = SellerType.Create("SLT00001", "Privat", 10m, 0.5m);
        await dbContext.SellerTypes.AddAsync(sellerType, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);
        var sut = new SellerCountBySellerTypeQuery(dbContext);

        var count = await sut.CountBySellerTypeId("SLT00001");

        Assert.Equal(0, count);
    }
}
