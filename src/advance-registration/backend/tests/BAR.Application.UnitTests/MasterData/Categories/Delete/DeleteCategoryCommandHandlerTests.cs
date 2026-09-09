using BAR.Application.MasterData.Categories.Delete;
using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.MasterData.Categories.Delete;

public class DeleteCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _categories = new();

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var category = Category.Create("Frei", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _categories.Setup(c => c.CountArticlesWithNameAsync("Frei", It.IsAny<CancellationToken>())).ReturnsAsync(0);
        var handler = new DeleteCategoryCommandHandler(_categories.Object);

        await handler.HandleAsync(category.Id, TestContext.Current.CancellationToken);

        _categories.Verify(c => c.DeleteAsync(category, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var category = Category.Create("Belegt", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _categories.Setup(c => c.CountArticlesWithNameAsync("Belegt", It.IsAny<CancellationToken>())).ReturnsAsync(3);
        var handler = new DeleteCategoryCommandHandler(_categories.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(category.Id, TestContext.Current.CancellationToken));

        Assert.Equal("category.in_use", ex.ErrorCode);
        _categories.Verify(c => c.DeleteAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
