using Bazaar.Domain.Brands;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class BrandRepositoryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    [Fact]
    public async Task Add_PersistsBrand_FindableByGetById()
    {
        await using var dbContext = CreateContext();
        var sut = new BrandRepository(dbContext);
        var brand = Brand.Create("BRAND001", "Adidas", original: true);

        await sut.Add(brand);

        var found = await sut.GetById("BRAND001");
        Assert.NotNull(found);
        Assert.Equal("Adidas", found!.Name);
    }

    [Fact]
    public async Task GetById_UnknownId_ReturnsNull()
    {
        await using var dbContext = CreateContext();
        var sut = new BrandRepository(dbContext);

        var found = await sut.GetById("UNKNOWN1");

        Assert.Null(found);
    }

    [Fact]
    public async Task GetAll_ReturnsAllBrands()
    {
        await using var dbContext = CreateContext();
        var sut = new BrandRepository(dbContext);
        await sut.Add(Brand.Create("BRAND001", "Adidas", original: true));
        await sut.Add(Brand.Create("BRAND002", "Nike", original: false));

        var found = await sut.GetAll();

        Assert.Equal(2, found.Count);
    }

    [Fact]
    public async Task ExistsByNameIgnoreCase_ExistingName_ReturnsTrue()
    {
        await using var dbContext = CreateContext();
        var sut = new BrandRepository(dbContext);
        await sut.Add(Brand.Create("BRAND001", "Adidas", original: true));

        Assert.True(await sut.ExistsByNameIgnoreCase("Adidas"));
    }

    [Fact]
    public async Task ExistsByNameIgnoreCase_UnknownName_ReturnsFalse()
    {
        await using var dbContext = CreateContext();
        var sut = new BrandRepository(dbContext);

        Assert.False(await sut.ExistsByNameIgnoreCase("Puma"));
    }

    [Fact]
    public async Task Remove_DeletesBrand()
    {
        await using var dbContext = CreateContext();
        var sut = new BrandRepository(dbContext);
        var brand = Brand.Create("BRAND001", "Adidas", original: true);
        await sut.Add(brand);

        await sut.Remove(brand);

        Assert.Null(await sut.GetById("BRAND001"));
    }
}
