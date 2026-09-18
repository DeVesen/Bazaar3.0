using Bazaar.Domain.Categories;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class CategoryRepositoryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    [Fact]
    public async Task Add_PersistsCategory_FindableByGetById()
    {
        await using var dbContext = CreateContext();
        var sut = new CategoryRepository(dbContext);
        var category = Category.Create("CAT00001", "Sport", original: true);

        await sut.Add(category);

        var found = await sut.GetById("CAT00001");
        Assert.NotNull(found);
        Assert.Equal("Sport", found!.Name);
    }

    [Fact]
    public async Task GetById_UnknownId_ReturnsNull()
    {
        await using var dbContext = CreateContext();
        var sut = new CategoryRepository(dbContext);

        var found = await sut.GetById("UNKNOWN1");

        Assert.Null(found);
    }

    [Fact]
    public async Task GetAll_ReturnsAllCategories()
    {
        await using var dbContext = CreateContext();
        var sut = new CategoryRepository(dbContext);
        await sut.Add(Category.Create("CAT00001", "Sport", original: true));
        await sut.Add(Category.Create("CAT00002", "Freizeit", original: false));

        var found = await sut.GetAll();

        Assert.Equal(2, found.Count);
    }

    [Fact]
    public async Task ExistsByNameIgnoreCase_ExistingName_ReturnsTrue()
    {
        await using var dbContext = CreateContext();
        var sut = new CategoryRepository(dbContext);
        await sut.Add(Category.Create("CAT00001", "Sport", original: true));

        Assert.True(await sut.ExistsByNameIgnoreCase("Sport"));
    }

    [Fact]
    public async Task ExistsByNameIgnoreCase_UnknownName_ReturnsFalse()
    {
        await using var dbContext = CreateContext();
        var sut = new CategoryRepository(dbContext);

        Assert.False(await sut.ExistsByNameIgnoreCase("Deko"));
    }

    [Fact]
    public async Task Update_PersistsChanges()
    {
        await using var dbContext = CreateContext();
        var sut = new CategoryRepository(dbContext);
        var category = Category.Create("CAT00001", "Sport", original: true);
        await sut.Add(category);

        category.Rename("Sport & Freizeit");
        category.SetOriginal(false);
        await sut.Update(category);

        var found = await sut.GetById("CAT00001");
        Assert.NotNull(found);
        Assert.Equal("Sport & Freizeit", found!.Name);
        Assert.False(found.Original);
    }

    [Fact]
    public async Task Remove_DeletesCategory()
    {
        await using var dbContext = CreateContext();
        var sut = new CategoryRepository(dbContext);
        var category = Category.Create("CAT00001", "Sport", original: true);
        await sut.Add(category);

        await sut.Remove(category);

        Assert.Null(await sut.GetById("CAT00001"));
    }
}
