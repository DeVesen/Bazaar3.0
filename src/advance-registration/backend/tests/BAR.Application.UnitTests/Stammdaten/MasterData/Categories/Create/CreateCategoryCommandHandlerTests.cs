using BAR.Modules.Stammdaten.Application.MasterData.Categories.Create;
using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Stammdaten.MasterData.Categories.Create;

public class CreateCategoryCommandHandlerTests
{
    private readonly Mock<ICategoryRepository> _categories = new();

    [Fact]
    public async Task HandleAsync_AdminCaller_SetsOriginalTrue()
    {
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("Jacken", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateCategoryCommandHandler(_categories.Object);

        var result = await handler.HandleAsync(new CreateCategoryCommand("Jacken", IsAdmin: true), TestContext.Current.CancellationToken);

        Assert.True(result.Original);
    }

    [Fact]
    public async Task HandleAsync_SellerCaller_SetsOriginalFalse()
    {
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("Schuhe", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateCategoryCommandHandler(_categories.Object);

        var result = await handler.HandleAsync(new CreateCategoryCommand("Schuhe", IsAdmin: false), TestContext.Current.CancellationToken);

        Assert.False(result.Original);
    }

    [Fact]
    public async Task HandleAsync_DuplicateName_ThrowsConflict()
    {
        _categories.Setup(c => c.ExistsByNameCaseInsensitiveAsync("jacken", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new CreateCategoryCommandHandler(_categories.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(new CreateCategoryCommand("jacken", IsAdmin: false), TestContext.Current.CancellationToken));

        Assert.Equal("master_data.name_taken", ex.ErrorCode);
    }
}
