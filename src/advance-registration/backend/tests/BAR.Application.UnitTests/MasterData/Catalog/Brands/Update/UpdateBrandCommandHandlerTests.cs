using BAR.Modules.MasterData.Application.Catalog.Brands.Update;
using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Modules.MasterData.Domain.Catalog;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.MasterData.MasterData.Brands.Update;

public class UpdateBrandCommandHandlerTests
{
    private readonly Mock<IBrandRepository> _brands = new();

    [Fact]
    public async Task HandleAsync_RenamesBrand()
    {
        var brand = Brand.Create("Alt", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Neu", brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new UpdateBrandCommandHandler(_brands.Object);

        var result = await handler.HandleAsync(brand.Id, new UpdateBrandCommand("Neu", true), TestContext.Current.CancellationToken);

        Assert.Equal("Neu", result.Name);
        Assert.True(result.Original);
        // The cascading rename in Registration now runs via the BrandRenamed
        // event (MasterDataDbContext.SaveChangesAsync -> BrandRenamedHandler),
        // no longer via a renameArticlesFrom parameter here.
        _brands.Verify(b => b.UpdateAsync(brand, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _brands.Setup(b => b.GetByIdAsync("x", It.IsAny<CancellationToken>())).ReturnsAsync((Brand?)null);
        var handler = new UpdateBrandCommandHandler(_brands.Object);

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.HandleAsync("x", new UpdateBrandCommand("Neu", true), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_NameTakenByOther_ThrowsConflict()
    {
        var brand = Brand.Create("Alt", original: false);
        _brands.Setup(b => b.GetByIdAsync(brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(brand);
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Belegt", brand.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new UpdateBrandCommandHandler(_brands.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(brand.Id, new UpdateBrandCommand("Belegt", false), TestContext.Current.CancellationToken));

        Assert.Equal("master_data.name_taken", ex.ErrorCode);
    }
}
