using BAR.Modules.Stammdaten.Application.MasterData.Brands.Create;
using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Stammdaten.MasterData.Brands.Create;

public class CreateBrandCommandHandlerTests
{
    private readonly Mock<IBrandRepository> _brands = new();

    [Fact]
    public async Task HandleAsync_AdminCaller_SetsOriginalTrue()
    {
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Jako-O", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateBrandCommandHandler(_brands.Object);

        var result = await handler.HandleAsync(new CreateBrandCommand("Jako-O", IsAdmin: true), TestContext.Current.CancellationToken);

        Assert.True(result.Original);
    }

    [Fact]
    public async Task HandleAsync_SellerCaller_SetsOriginalFalse()
    {
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("Nike", null, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = new CreateBrandCommandHandler(_brands.Object);

        var result = await handler.HandleAsync(new CreateBrandCommand("Nike", IsAdmin: false), TestContext.Current.CancellationToken);

        Assert.False(result.Original);
    }

    [Fact]
    public async Task HandleAsync_DuplicateName_ThrowsConflict()
    {
        _brands.Setup(b => b.ExistsByNameCaseInsensitiveAsync("nike", null, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = new CreateBrandCommandHandler(_brands.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(new CreateBrandCommand("nike", IsAdmin: false), TestContext.Current.CancellationToken));

        Assert.Equal("master_data.name_taken", ex.ErrorCode);
    }
}
