using Bazaar.Domain.BlankLabels;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class LabelSheetFormatRepositoryTests
{
    // EF Core InMemory kann Complex Properties nicht lesen (siehe SettingsRepositoryTests).
    private static BazaarDbContext CreateContext(SqliteConnection connection) =>
        new(new DbContextOptionsBuilder<BazaarDbContext>().UseSqlite(connection).Options);

    private static LabelSheetGeometry Avery16() =>
        new(210m, 297m, 105m, 35m, 8.5m, 0m, 8.5m, 0m, 0m, 0m, 2, 8);

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
    public async Task Add_NewFormat_IsFoundInFreshContext()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using (var writeContext = CreateContext(connection))
        {
            await new LabelSheetFormatRepository(writeContext).Add(LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16()));
        }
        await using var readContext = CreateContext(connection);
        var sut = new LabelSheetFormatRepository(readContext);

        // Act
        var found = await sut.GetById("LSF00001");

        // Assert
        Assert.NotNull(found);
        Assert.Equal("Avery 12er", found!.Name);
        Assert.Equal(Avery16(), found.Geometry);
    }

    [Fact]
    public async Task FindByName_ExactName_ReturnsFormat()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var dbContext = CreateContext(connection);
        var sut = new LabelSheetFormatRepository(dbContext);
        await sut.Add(LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16()));

        // Act
        var found = await sut.FindByName("Avery 12er");

        // Assert
        Assert.Equal("LSF00001", found?.Id);
    }

    [Fact]
    public async Task FindByName_DifferentCase_ReturnsNull()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var dbContext = CreateContext(connection);
        var sut = new LabelSheetFormatRepository(dbContext);
        await sut.Add(LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16()));

        // Act
        var found = await sut.FindByName("avery 12er");

        // Assert
        Assert.Null(found);
    }

    [Fact]
    public async Task Update_ReplacedGeometry_IsPersisted()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        var avery12 = new LabelSheetGeometry(210m, 297m, 105m, 48m, 4.5m, 0m, 4.5m, 0m, 0m, 0m, 2, 6);
        await using (var writeContext = CreateContext(connection))
        {
            var repository = new LabelSheetFormatRepository(writeContext);
            var format = LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16());
            await repository.Add(format);
            format.ReplaceGeometry(avery12);
            await repository.Update(format);
        }
        await using var readContext = CreateContext(connection);

        // Act
        var found = await new LabelSheetFormatRepository(readContext).GetById("LSF00001");

        // Assert
        Assert.Equal(avery12, found!.Geometry);
    }

    [Fact]
    public async Task Remove_ExistingFormat_IsGoneFromGetAll()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var dbContext = CreateContext(connection);
        var sut = new LabelSheetFormatRepository(dbContext);
        var format = LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16());
        await sut.Add(format);

        // Act
        await sut.Remove(format);

        // Assert
        Assert.Empty(await sut.GetAll());
    }
}
