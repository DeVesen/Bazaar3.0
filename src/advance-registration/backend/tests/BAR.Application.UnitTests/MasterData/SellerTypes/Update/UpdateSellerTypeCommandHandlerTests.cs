using BAR.Modules.MasterData.Application.SellerTypes.Update;
using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.MasterData.Domain.SellerTypes;
using BAR.Modules.SellerManagement.Contracts;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.MasterData.SellerTypes.Update;

public class UpdateSellerTypeCommandHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _types = new();
    private readonly Mock<ISellerManagementModuleApi> _sellerManagement = new();

    private UpdateSellerTypeCommandHandler CreateHandler() => new(_types.Object, _sellerManagement.Object);

    [Fact]
    public async Task HandleAsync_ValidData_UpdatesAndReturnsSellerCount()
    {
        var type = SellerType.Create("Alt", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.ExistsByNameAsync("Neu", type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _sellerManagement.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(5);
        var handler = CreateHandler();

        var result = await handler.HandleAsync(type.Id, new UpdateSellerTypeCommand("Neu", 15m, 0.30m), TestContext.Current.CancellationToken);

        Assert.Equal("Neu", result.Name);
        Assert.Equal(15m, result.CommissionRate);
        Assert.Equal(5, result.SellerCount);
        _types.Verify(t => t.UpdateAsync(type, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownId_ThrowsNotFound()
    {
        _types.Setup(t => t.GetByIdAsync("x", It.IsAny<CancellationToken>())).ReturnsAsync((SellerType?)null);
        var handler = CreateHandler();

        await Assert.ThrowsAsync<NotFoundException>(() =>
            handler.HandleAsync("x", new UpdateSellerTypeCommand("Neu", 15m, 0.30m), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_NameTakenByOther_ThrowsConflict()
    {
        var type = SellerType.Create("Alt", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.ExistsByNameAsync("Belegt", type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, new UpdateSellerTypeCommand("Belegt", 15m, 0.30m), TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.name_taken", ex.ErrorCode);
    }
}
