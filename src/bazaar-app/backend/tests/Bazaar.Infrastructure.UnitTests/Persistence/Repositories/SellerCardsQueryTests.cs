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
    public async Task GetCards_StatusSelling_CurrentlyReturnsSameSetAsOpen()
    {
        // Round-15 TODO: "selling" (>=1 released, unsettled article) can't be told
        // apart from plain "open" until Articles exist — see SellerCardsQuery's
        // class summary. Both resolve to "non-settled" for now.
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerCardsQuery(dbContext);

        var openPage = await sut.GetCards(null, "open", null, 1, 60);
        var sellingPage = await sut.GetCards(null, "selling", null, 1, 60);

        Assert.Equal(
            openPage.Items.Select(i => i.Id).OrderBy(id => id),
            sellingPage.Items.Select(i => i.Id).OrderBy(id => id));
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
