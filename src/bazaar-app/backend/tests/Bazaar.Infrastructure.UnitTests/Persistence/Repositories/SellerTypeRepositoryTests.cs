using Bazaar.Domain.SellerTypes;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class SellerTypeRepositoryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    [Fact]
    public async Task Add_PersistsSellerType_FindableByGetById()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerTypeRepository(dbContext);
        var sellerType = SellerType.Create("SLT00001", "Verein", 10m, 0.5m);

        await sut.Add(sellerType);

        var found = await sut.GetById("SLT00001");
        Assert.NotNull(found);
        Assert.Equal("Verein", found!.Name);
    }

    [Fact]
    public async Task GetById_UnknownId_ReturnsNull()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerTypeRepository(dbContext);

        var found = await sut.GetById("UNKNOWN1");

        Assert.Null(found);
    }

    [Fact]
    public async Task GetAll_ReturnsAllSellerTypes()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerTypeRepository(dbContext);
        await sut.Add(SellerType.Create("SLT00001", "Verein", 10m, 0.5m));
        await sut.Add(SellerType.Create("SLT00002", "Privat", 5m, 0m));

        var found = await sut.GetAll();

        Assert.Equal(2, found.Count);
    }

    [Fact]
    public async Task ExistsByNameIgnoreCase_ExistingName_ReturnsTrue()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerTypeRepository(dbContext);
        await sut.Add(SellerType.Create("SLT00001", "Verein", 10m, 0.5m));

        Assert.True(await sut.ExistsByNameIgnoreCase("Verein"));
    }

    [Fact]
    public async Task ExistsByNameIgnoreCase_UnknownName_ReturnsFalse()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerTypeRepository(dbContext);

        Assert.False(await sut.ExistsByNameIgnoreCase("Privat"));
    }

    [Fact]
    public async Task Update_PersistsChanges()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerTypeRepository(dbContext);
        var sellerType = SellerType.Create("SLT00001", "Verein", 10m, 0.5m);
        await sut.Add(sellerType);

        sellerType.Update("Verein neu", 12m, 0.75m);
        await sut.Update(sellerType);

        var found = await sut.GetById("SLT00001");
        Assert.NotNull(found);
        Assert.Equal("Verein neu", found!.Name);
        Assert.Equal(12m, found.CommissionRate);
        Assert.Equal(0.75m, found.ItemFee);
    }

    [Fact]
    public async Task Remove_DeletesSellerType()
    {
        await using var dbContext = CreateContext();
        var sut = new SellerTypeRepository(dbContext);
        var sellerType = SellerType.Create("SLT00001", "Verein", 10m, 0.5m);
        await sut.Add(sellerType);

        await sut.Remove(sellerType);

        Assert.Null(await sut.GetById("SLT00001"));
    }
}
