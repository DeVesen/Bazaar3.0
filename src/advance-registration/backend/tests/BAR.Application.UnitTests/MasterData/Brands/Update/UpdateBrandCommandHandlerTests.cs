using BAR.Application.MasterData.Brands.Update;
using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.MasterData.Brands.Update;

public class UpdateBrandCommandHandlerTests
{
    private readonly Mock<IBrandRepository> _brands = new();

    [Fact]
    public async Task HandleAsync_RenamesAndCascades()
    {
        var brand = Brand.Create("Alt", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Neu", brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new UpdateBrandCommandHandler(_brands.Object);

        var result = await handler.HandleAsync(new UpdateBrandCommand(brand.Id, "Neu", true), TestContext.Current.CancellationToken);

        Assert.Equal("Neu", result.Name);
        Assert.True(result.Original);
        _brands.Verify(b => b.UpdateAsync(brand, "Alt", It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _brands.Setup(b => b.GetByIdAsync("x", It.IsAny<CancellationToken>())).ReturnsAsync((Brand?)null);
        var handler = new UpdateBrandCommandHandler(_brands.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.HandleAsync(new UpdateBrandCommand("x", "Neu", true), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_NameTakenByOther_ThrowsConflict()
    {
        var brand = Brand.Create("Alt", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Belegt", brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new UpdateBrandCommandHandler(_brands.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(new UpdateBrandCommand(brand.Id, "Belegt", false), TestContext.Current.CancellationToken));

        Assert.Equal("master_data.name_taken", ex.ErrorCode);
    }
}
