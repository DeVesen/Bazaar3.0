using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Stammdaten.Application.MasterData.Categories.Delete;
using BAR.Modules.Stammdaten.Domain.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Stammdaten.MasterData.Categories.Delete;

public class DeleteCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _categories = new();
    private readonly Mock<IAnmeldungModuleApi> _anmeldung = new();

    private DeleteCategoryCommandHandler CreateHandler() => new(_categories.Object, _anmeldung.Object);

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var category = Category.Create("Frei", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _anmeldung.Setup(a => a.CountArticlesWithCategoryNameAsync("Frei", It.IsAny<CancellationToken>())).ReturnsAsync(0);
        var handler = CreateHandler();

        await handler.HandleAsync(category.Id, TestContext.Current.CancellationToken);

        _categories.Verify(c => c.DeleteAsync(category, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var category = Category.Create("Belegt", original: false);
        _categories.Setup(c => c.GetByIdAsync(category.Id, It.IsAny<CancellationToken>())).ReturnsAsync(category);
        _anmeldung.Setup(a => a.CountArticlesWithCategoryNameAsync("Belegt", It.IsAny<CancellationToken>())).ReturnsAsync(3);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(category.Id, TestContext.Current.CancellationToken));

        Assert.Equal("category.in_use", ex.ErrorCode);
        _categories.Verify(c => c.DeleteAsync(It.IsAny<Category>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
