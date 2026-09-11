using BAR.Modules.Stammdaten.Application.MasterData.Categories.Update;
using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Modules.Stammdaten.Domain.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Stammdaten.MasterData.Categories.Update;

public class UpdateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _categories = new();

    [Fact]
    public async Task HandleAsync_RenamesCategory()
    {
        var category = Category.Create("Alt", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("Neu", category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new UpdateCategoryCommandHandler(_categories.Object);

        var result = await handler.HandleAsync(category.Id, new UpdateCategoryCommand("Neu", true), TestContext.Current.CancellationToken);

        Assert.Equal("Neu", result.Name);
        Assert.True(result.Original);
        // Cascade-Rename in Anmeldung laeuft ueber das CategoryRenamed-Event,
        // nicht mehr ueber einen renameArticlesFrom-Parameter hier.
        _categories.Verify(c => c.UpdateAsync(category, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _categories.Setup(c => c.GetByIdAsync("x", It.IsAny<CancellationToken>())).ReturnsAsync((Category?)null);
        var handler = new UpdateCategoryCommandHandler(_categories.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.HandleAsync("x", new UpdateCategoryCommand("Neu", true), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_NameTakenByOther_ThrowsConflict()
    {
        var category = Category.Create("Alt", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("Belegt", category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new UpdateCategoryCommandHandler(_categories.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(category.Id, new UpdateCategoryCommand("Belegt", false), TestContext.Current.CancellationToken));

        Assert.Equal("master_data.name_taken", ex.ErrorCode);
    }
}
