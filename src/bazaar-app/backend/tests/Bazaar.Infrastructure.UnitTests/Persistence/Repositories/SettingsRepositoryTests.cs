using Bazaar.Domain.Settings;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class SettingsRepositoryTests
{
    // EF Core InMemory kann Complex Properties nicht lesen (KeyNotFoundException im Shaper);
    // SQLite bildet zudem das relationale Spalten-Mapping der Freitexte mit ab.
    private static BazaarDbContext CreateContext(SqliteConnection connection)
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseSqlite(connection)
            .Options;
        return new BazaarDbContext(options);
    }

    private static async Task<SettingsAggregate> Reload(SqliteConnection connection)
    {
        await using var context = CreateContext(connection);
        return await new SettingsRepository(context).Get();
    }

    [Fact]
    public async Task Update_PrintTexts_PersistsBothTextSets()
    {
        // Arrange
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync(cancellationToken);
        await using (var seedContext = CreateContext(connection))
        {
            await seedContext.Database.EnsureCreatedAsync(cancellationToken);
            await seedContext.Settings.AddAsync(SettingsAggregate.Create(3000), cancellationToken);
            await seedContext.SaveChangesAsync(cancellationToken);
        }

        await using (var writeContext = CreateContext(connection))
        {
            var repository = new SettingsRepository(writeContext);
            var settings = await repository.Get();
            settings.UpdatePrintTexts(
                new PrintTexts("a1", "a2", "a3", "a4", "a5"),
                new PrintTexts("v1", "v2", "v3", "v4", "v5"));
            await repository.Update(settings);
        }

        // Act
        var reloaded = await Reload(connection);

        // Assert
        Assert.Equal(new PrintTexts("a1", "a2", "a3", "a4", "a5"), reloaded.AbgabeBeleg);
        Assert.Equal(new PrintTexts("v1", "v2", "v3", "v4", "v5"), reloaded.VerkaeuferUebersicht);
    }

    [Fact]
    public async Task Add_ReleaseOnCloseDisabled_PersistsFalseOnInsert()
    {
        // Arrange
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync(cancellationToken);
        await using (var seedContext = CreateContext(connection))
        {
            await seedContext.Database.EnsureCreatedAsync(cancellationToken);
            var settings = SettingsAggregate.Create(3000);
            settings.Update(3000, false);
            await seedContext.Settings.AddAsync(settings, cancellationToken);
            await seedContext.SaveChangesAsync(cancellationToken);
        }

        // Act
        var reloaded = await Reload(connection);

        // Assert
        Assert.False(reloaded.ReleaseOnClose);
    }

    [Fact]
    public async Task Schema_ReleaseOnCloseColumn_DefaultsToTrue()
    {
        // Arrange
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var connection = new SqliteConnection("DataSource=:memory:");
        await connection.OpenAsync(cancellationToken);
        await using var context = CreateContext(connection);
        await context.Database.EnsureCreatedAsync(cancellationToken);
        await using var command = connection.CreateCommand();
        command.CommandText = "SELECT dflt_value FROM pragma_table_info('Settings') WHERE name = 'ReleaseOnClose'";

        // Act
        var defaultValue = await command.ExecuteScalarAsync(cancellationToken);

        // Assert
        Assert.Equal("1", Convert.ToString(defaultValue));
    }
}
