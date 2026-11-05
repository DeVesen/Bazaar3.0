using Bazaar.Domain.BlankLabels;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class LabelPrintDefaultsRepositoryTests
{
    private static readonly LabelElementSizes ChangedSizes =
        new(QrCode: 25.5m, SellerSymbol: 6m, NumberHeight: 9.5m, CurrencyHeight: 11m);

    // EF Core InMemory kann Complex Properties nicht lesen (siehe SettingsRepositoryTests).
    private static BazaarDbContext CreateContext(SqliteConnection connection) =>
        new(new DbContextOptionsBuilder<BazaarDbContext>().UseSqlite(connection).Options);

    private static async Task<SqliteConnection> OpenDatabase()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync(cancellationToken);
        await using var context = CreateContext(connection);
        await context.Database.EnsureCreatedAsync(cancellationToken);
        return connection;
    }

    [Fact]
    public async Task Find_NothingStored_ReturnsNull()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var dbContext = CreateContext(connection);
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
        await using var connection = await OpenDatabase();
        var logo = new LabelGraphic(LabelGraphicKind.Image, "data:image/png;base64,AAAA");
        var symbol = new LabelGraphic(LabelGraphicKind.Icon, "star");
        await using (var writeContext = CreateContext(connection))
        {
            var defaults = LabelPrintDefaults.CreateInitial();
            defaults.Update(logo, symbol, "$", LabelElementSizes.Default);
            await new LabelPrintDefaultsRepository(writeContext).Add(defaults);
        }
        await using var readContext = CreateContext(connection);

        // Act
        var found = await new LabelPrintDefaultsRepository(readContext).Find();

        // Assert
        Assert.Equal(logo, found!.Logo);
        Assert.Equal(symbol, found.SellerSymbol);
        Assert.Equal("$", found.CurrencySymbol);
    }

    [Fact]
    public async Task Update_ChangedCurrencyAndSizes_ArePersisted()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using (var writeContext = CreateContext(connection))
        {
            var repository = new LabelPrintDefaultsRepository(writeContext);
            var defaults = LabelPrintDefaults.CreateInitial();
            await repository.Add(defaults);
            defaults.Update(null, null, "CHF", ChangedSizes);
            await repository.Update(defaults);
        }
        await using var readContext = CreateContext(connection);

        // Act
        var found = await new LabelPrintDefaultsRepository(readContext).Find();

        // Assert
        Assert.Equal("CHF", found!.CurrencySymbol);
        Assert.Equal(ChangedSizes, found.Sizes);
    }
}
