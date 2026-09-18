using Bazaar.Domain.Sellers;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class SellerRepositoryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    private static Seller CreateSeller(string id = "SEL00001", string firstName = "Anna", string lastName = "Meier") =>
        Seller.Create(
            id,
            firstName,
            lastName,
            address: null,
            postalCode: "76133",
            city: "Karlsruhe",
            phone: null,
            email: "anna@example.org",
            sellerTypeId: "SLT00001",
            salesCommission: 10m,
            feePerItem: 0.5m);

    [Fact]
    public async Task Add_PersistsSeller_FindableByGetById()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerRepository(dbContext);
        var seller = CreateSeller();

        await sut.Add(seller);

        var found = await sut.GetById("SEL00001");
        Assert.NotNull(found);
        Assert.Equal("Anna", found!.FirstName);
        Assert.Equal("Meier", found.LastName);
    }

    [Fact]
    public async Task GetById_UnknownId_ReturnsNull()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerRepository(dbContext);

        var found = await sut.GetById("UNKNOWN1");

        Assert.Null(found);
    }

    [Fact]
    public async Task Update_PersistsChanges()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerRepository(dbContext);
        var seller = CreateSeller();
        await sut.Add(seller);

        seller.UpdateDetails(
            "Anna",
            "Schmidt",
            address: null,
            postalCode: "76133",
            city: "Karlsruhe",
            phone: null,
            email: "anna@example.org",
            sellerTypeId: "SLT00001");
        await sut.Update(seller);

        var found = await sut.GetById("SEL00001");
        Assert.NotNull(found);
        Assert.Equal("Schmidt", found!.LastName);
    }

    [Fact]
    public async Task Remove_DeletesSeller()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerRepository(dbContext);
        var seller = CreateSeller();
        await sut.Add(seller);

        await sut.Remove(seller);

        Assert.Null(await sut.GetById("SEL00001"));
    }
}
