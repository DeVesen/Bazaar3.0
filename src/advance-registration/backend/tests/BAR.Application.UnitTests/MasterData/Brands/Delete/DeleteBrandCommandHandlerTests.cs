using BAR.Application.MasterData.Brands.Delete;
using BAR.Domain.Exceptions;
using BAR.Domain.MasterData;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.MasterData.Brands.Delete;

public class DeleteBrandCommandHandlerTests
{
    private readonly Mock<IBrandRepository> _brands = new();

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var brand = Brand.Create("Frei", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.CountArticlesWithNameAsync("Frei", It.IsAny<CancellationToken>())).ReturnsAsync(0);
        var handler = new DeleteBrandCommandHandler(_brands.Object);

        await handler.HandleAsync(brand.Id, TestContext.Current.CancellationToken);

        _brands.Verify(b => b.DeleteAsync(brand, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var brand = Brand.Create("Belegt", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.CountArticlesWithNameAsync("Belegt", It.IsAny<CancellationToken>())).ReturnsAsync(3);
        var handler = new DeleteBrandCommandHandler(_brands.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(brand.Id, TestContext.Current.CancellationToken));

        Assert.Equal("brand.in_use", ex.ErrorCode);
        _brands.Verify(b => b.DeleteAsync(It.IsAny<Brand>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
