using Bazaar.Domain.BlankLabels;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class LabelImageRepositoryTests
{
    private static readonly DateTimeOffset Start = new(2026, 11, 5, 10, 0, 0, TimeSpan.Zero);

    private static BazaarDbContext CreateContext(SqliteConnection connection) =>
        new(new DbContextOptionsBuilder<BazaarDbContext>().UseSqlite(connection).Options);

    private static LabelImage Image(string id, string name, byte content, DateTimeOffset createdAt) =>
        LabelImage.Create(id, name, $"data:image/png;base64,{Convert.ToBase64String([content])}", createdAt);

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
    public async Task Add_NewImage_IsFoundByIdWithDataUrlInFreshContext()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        var image = Image("LIM00001", "Logo", 1, Start);
        await using (var writeContext = CreateContext(connection))
        {
            await new LabelImageRepository(writeContext).Add(image);
        }
        await using var readContext = CreateContext(connection);

        // Act
        var found = await new LabelImageRepository(readContext).GetById("LIM00001");

        // Assert
        Assert.Equal(image.DataUrl, found!.DataUrl);
        Assert.Equal("Logo", found.Name);
        Assert.Equal(image.ContentHash, found.ContentHash);
    }

    [Fact]
    public async Task Add_NewImage_ReturnsTheAddedImage()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var context = CreateContext(connection);
        var image = Image("LIM00001", "Logo", 1, Start);

        // Act
        var stored = await new LabelImageRepository(context).Add(image);

        // Assert
        Assert.Same(image, stored);
    }

    [Fact]
    public async Task GetSummaries_SeveralImages_NewestFirst()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var context = CreateContext(connection);
        var sut = new LabelImageRepository(context);
        await sut.Add(Image("LIM00001", "Alt", 1, Start));
        await sut.Add(Image("LIM00003", "Neu", 3, Start.AddHours(2)));
        await sut.Add(Image("LIM00002", "Mitte", 2, Start.AddHours(1)));

        // Act
        var summaries = await sut.GetSummaries();

        // Assert
        Assert.Equal(["Neu", "Mitte", "Alt"], summaries.Select(s => s.Name));
    }

    [Fact]
    public async Task GetSummaries_StoredImage_DoesNotLoadDataUrl()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var context = CreateContext(connection);
        var sut = new LabelImageRepository(context);
        await sut.Add(Image("LIM00001", "Logo", 1, Start));
        context.ChangeTracker.Clear();

        // Act
        var summaries = await sut.GetSummaries();

        // Assert
        var summary = Assert.Single(summaries);
        Assert.Equal(new LabelImageSummary("LIM00001", "Logo", "image/png", 1, Start), summary);
        Assert.Empty(context.ChangeTracker.Entries<LabelImage>());
    }

    [Fact]
    public async Task FindByHash_KnownHash_ReturnsImage()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var context = CreateContext(connection);
        var sut = new LabelImageRepository(context);
        var image = Image("LIM00001", "Logo", 1, Start);
        await sut.Add(image);

        // Act
        var found = await sut.FindByHash(image.ContentHash);

        // Assert
        Assert.Equal("LIM00001", found?.Id);
    }

    [Fact]
    public async Task Count_TwoImages_ReturnsTwo()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var context = CreateContext(connection);
        var sut = new LabelImageRepository(context);
        await sut.Add(Image("LIM00001", "A", 1, Start));
        await sut.Add(Image("LIM00002", "B", 2, Start));

        // Act
        var count = await sut.Count();

        // Assert
        Assert.Equal(2, count);
    }

    [Fact]
    public async Task Remove_ExistingImage_IsGoneFromSummaries()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var context = CreateContext(connection);
        var sut = new LabelImageRepository(context);
        var image = Image("LIM00001", "Logo", 1, Start);
        await sut.Add(image);

        // Act
        await sut.Remove(image);

        // Assert
        Assert.Empty(await sut.GetSummaries());
    }

    [Fact]
    public async Task SaveChanges_SecondImageWithSameHash_ViolatesUniqueIndex()
    {
        // Arrange
        await using var connection = await OpenDatabase();
        await using var context = CreateContext(connection);
        context.LabelImages.Add(Image("LIM00001", "A", 1, Start));
        context.LabelImages.Add(Image("LIM00002", "B", 1, Start));

        // Act
        var act = () => context.SaveChangesAsync(TestContext.Current.CancellationToken);

        // Assert
        await Assert.ThrowsAsync<DbUpdateException>(act);
    }
}
