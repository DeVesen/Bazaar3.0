using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class SellerSearchQueryTests
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

        await dbContext.Sellers.AddAsync(Seller.Create(
            "SEL00001", "Anna", "Meier", null, "76133", "Karlsruhe", null,
            "anna@example.org", "SLT00001", 10m, 0.5m));
        await dbContext.Sellers.AddAsync(Seller.Create(
            "SEL00002", "Max", "Mustermann", null, "76133", "Karlsruhe", null,
            "max@example.org", "SLT00001", 10m, 0.5m));
        await dbContext.Sellers.AddAsync(Seller.Create(
            "SEL00003", "Petra", "Klein", null, "76133", "Karlsruhe", null,
            "petra@example.org", "SLT00001", 10m, 0.5m));
        await dbContext.Sellers.AddAsync(Seller.Create(
            "SEL00004", "Jonas", "Fischer", null, "79098", "Freiburg", null,
            "jonas@example.org", "SLT00001", 10m, 0.5m));

        await dbContext.SaveChangesAsync();
    }

    [Fact]
    public async Task Search_EmptyQuery_ReturnsAllSellers()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search(null);

        Assert.Equal(4, found.Count);
    }

    [Fact]
    public async Task Search_WhitespaceQuery_ReturnsAllSellers()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("   ");

        Assert.Equal(4, found.Count);
    }

    [Fact]
    public async Task Search_SingleToken_MatchesLastNameCaseInsensitive()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("mei");

        Assert.Single(found);
        Assert.Equal("SEL00001", found[0].Id);
    }

    [Fact]
    public async Task Search_SingleToken_MatchesId()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("SEL00002");

        Assert.Single(found);
        Assert.Equal("SEL00002", found[0].Id);
    }

    [Fact]
    public async Task Search_MultipleTokens_AndsAcrossTokens()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("Max Mustermann");

        Assert.Single(found);
        Assert.Equal("SEL00002", found[0].Id);
    }

    [Fact]
    public async Task Search_MultipleTokens_NoSellerMatchesAllTokens_ReturnsEmpty()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("Anna Klein");

        Assert.Empty(found);
    }

    [Fact]
    public async Task Search_RepeatedSpaces_AreIgnored()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("Max   Mustermann");

        Assert.Single(found);
        Assert.Equal("SEL00002", found[0].Id);
    }

    [Fact]
    public async Task Search_ReturnsSellerTypeName()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("Anna");

        Assert.Single(found);
        Assert.Equal("Privat", found[0].SellerType);
    }

    [Fact]
    public async Task Search_CityOnlyToken_MatchesSellerByCity()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("Freiburg");

        Assert.Single(found);
        Assert.Equal("SEL00004", found[0].Id);
    }

    [Fact]
    public async Task Search_CityOnlyToken_IsCaseInsensitive()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("freiburg");

        Assert.Single(found);
        Assert.Equal("SEL00004", found[0].Id);
    }

    [Fact]
    public async Task Search_SettledSeller_AppearsWithSettledAtPopulated()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var settledAt = DateTimeOffset.UtcNow;
        var settledSeller = await dbContext.Sellers.FindAsync(["SEL00001"], TestContext.Current.CancellationToken);
        settledSeller!.Settle(42m, settledAt);
        await dbContext.SaveChangesAsync(TestContext.Current.CancellationToken);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("mei");

        Assert.Single(found);
        Assert.Equal(settledAt, found[0].SettledAt);
    }

    [Fact]
    public async Task Search_NonSettledSeller_HasNullSettledAt()
    {
        await using var dbContext = CreateContext();
        await SeedAsync(dbContext);
        var sut = new SellerSearchQuery(dbContext);

        var found = await sut.Search("mei");

        Assert.Single(found);
        Assert.Null(found[0].SettledAt);
    }
}
