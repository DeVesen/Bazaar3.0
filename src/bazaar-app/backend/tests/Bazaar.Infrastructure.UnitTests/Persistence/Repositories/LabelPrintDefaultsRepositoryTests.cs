using Bazaar.Domain.BlankLabels;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class LabelPrintDefaultsRepositoryTests
{
    private static BazaarDbContext CreateContext(string databaseName) =>
        new(new DbContextOptionsBuilder<BazaarDbContext>().UseInMemoryDatabase(databaseName).Options);

    [Fact]
    public async Task Find_NothingStored_ReturnsNull()
    {
        // Arrange
        await using var dbContext = CreateContext(Guid.NewGuid().ToString());
        var sut = new LabelPrintDefaultsRepository(dbContext);

        // Act
        var found = await sut.Find();

        // Assert
        Assert.Null(found);
    }

    [Fact]
    public async Task Add_DefaultsWithIconAndImage_AreFoundInFreshContext()
    {
        // Arrange
        var databaseName = Guid.NewGuid().ToString();
        var logo = new LabelGraphic(LabelGraphicKind.Image, "data:image/png;base64,AAAA");
        var symbol = new LabelGraphic(LabelGraphicKind.Icon, "star");
        await using (var writeContext = CreateContext(databaseName))
        {
            var defaults = LabelPrintDefaults.CreateInitial();
            defaults.Update(logo, symbol, "$");
            await new LabelPrintDefaultsRepository(writeContext).Add(defaults);
        }
        await using var readContext = CreateContext(databaseName);

        // Act
        var found = await new LabelPrintDefaultsRepository(readContext).Find();

        // Assert
        Assert.Equal(logo, found!.Logo);
        Assert.Equal(symbol, found.SellerSymbol);
        Assert.Equal("$", found.CurrencySymbol);
    }

    [Fact]
    public async Task Update_ChangedCurrency_IsPersisted()
    {
        // Arrange
        var databaseName = Guid.NewGuid().ToString();
        await using (var writeContext = CreateContext(databaseName))
        {
            var repository = new LabelPrintDefaultsRepository(writeContext);
            var defaults = LabelPrintDefaults.CreateInitial();
            await repository.Add(defaults);
            defaults.Update(null, null, "CHF");
            await repository.Update(defaults);
        }
        await using var readContext = CreateContext(databaseName);

        // Act
        var found = await new LabelPrintDefaultsRepository(readContext).Find();

        // Assert
        Assert.Equal("CHF", found!.CurrencySymbol);
    }
}
