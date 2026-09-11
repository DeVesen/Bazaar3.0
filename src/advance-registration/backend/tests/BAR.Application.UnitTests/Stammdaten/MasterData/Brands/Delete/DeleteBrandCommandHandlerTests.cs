using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Stammdaten.Application.MasterData.Brands.Delete;
using BAR.Modules.Stammdaten.Domain.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Stammdaten.MasterData.Brands.Delete;

public class DeleteBrandCommandHandlerTests
{
    private readonly Mock<IBrandRepository> _brands = new();
    private readonly Mock<IAnmeldungModuleApi> _anmeldung = new();

    private DeleteBrandCommandHandler CreateHandler() => new(_brands.Object, _anmeldung.Object);

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var brand = Brand.Create("Frei", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _anmeldung.Setup(a => a.CountArticlesWithBrandNameAsync("Frei", It.IsAny<CancellationToken>())).ReturnsAsync(0);
        var handler = CreateHandler();

        await handler.HandleAsync(brand.Id, TestContext.Current.CancellationToken);

        _brands.Verify(b => b.DeleteAsync(brand, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var brand = Brand.Create("Belegt", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _anmeldung.Setup(a => a.CountArticlesWithBrandNameAsync("Belegt", It.IsAny<CancellationToken>())).ReturnsAsync(3);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(brand.Id, TestContext.Current.CancellationToken));

        Assert.Equal("brand.in_use", ex.ErrorCode);
        _brands.Verify(b => b.DeleteAsync(It.IsAny<Brand>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
