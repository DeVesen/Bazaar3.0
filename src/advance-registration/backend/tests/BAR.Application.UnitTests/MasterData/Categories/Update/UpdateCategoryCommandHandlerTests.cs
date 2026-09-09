using BAR.Application.MasterData.Categories.Update;
using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.MasterData.Categories.Update;

public class UpdateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _categories = new();

    [Fact]
    public async Task HandleAsync_RenamesAndCascades()
    {
        var category = Category.Create("Alt", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("Neu", category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new UpdateCategoryCommandHandler(_categories.Object);

        var result = await handler.HandleAsync(new UpdateCategoryCommand(category.Id, "Neu", true), TestContext.Current.CancellationToken);

        Assert.Equal("Neu", result.Name);
        Assert.True(result.Original);
        _categories.Verify(c => c.UpdateAsync(category, "Alt", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _categories.Setup(c => c.GetByIdAsync("x", It.IsAny<CancellationToken>())).ReturnsAsync((Category?)null);
        var handler = new UpdateCategoryCommandHandler(_categories.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.HandleAsync(new UpdateCategoryCommand("x", "Neu", true), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_NameTakenByOther_ThrowsConflict()
    {
        var category = Category.Create("Alt", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("Belegt", category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new UpdateCategoryCommandHandler(_categories.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(new UpdateCategoryCommand(category.Id, "Belegt", false), TestContext.Current.CancellationToken));

        Assert.Equal("master_data.name_taken", ex.ErrorCode);
    }
}
