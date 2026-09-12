using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Application.Catalog.Categories.Delete;
using BAR.Modules.MasterData.Domain.Catalog;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.MasterData.MasterData.Categories.Delete;

public class DeleteCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _categories = new();
    private readonly Mock<IRegistrationModuleApi> _registration = new();

    private DeleteCategoryCommandHandler CreateHandler() => new(_categories.Object, _registration.Object);

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var category = Category.Create("Frei", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _registration.Setup(a => a.CountArticlesWithCategoryNameAsync("Frei", It.IsAny<CancellationToken>())).ReturnsAsync(0);
        var handler = CreateHandler();

        await handler.HandleAsync(category.Id, TestContext.Current.CancellationToken);

        _categories.Verify(c => c.DeleteAsync(category, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var category = Category.Create("Belegt", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _registration.Setup(a => a.CountArticlesWithCategoryNameAsync("Belegt", It.IsAny<CancellationToken>())).ReturnsAsync(3);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(category.Id, TestContext.Current.CancellationToken));

        Assert.Equal("category.in_use", ex.ErrorCode);
        _categories.Verify(c => c.DeleteAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
