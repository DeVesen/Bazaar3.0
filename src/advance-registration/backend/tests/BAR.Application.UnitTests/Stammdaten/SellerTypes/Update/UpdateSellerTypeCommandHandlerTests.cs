using BAR.Modules.Stammdaten.Application.SellerTypes.Update;
using BAR.Modules.Stammdaten.Contracts.SellerTypes;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.Modules.Stammdaten.Domain.SellerTypes;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Stammdaten.SellerTypes.Update;

public class UpdateSellerTypeCommandHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _types = new();
    private readonly Mock<IVerkaeuferverwaltungModuleApi> _verkaeuferverwaltung = new();

    private UpdateSellerTypeCommandHandler CreateHandler() => new(_types.Object, _verkaeuferverwaltung.Object);

    [Fact]
    public async Task HandleAsync_ValidData_UpdatesAndReturnsSellerCount()
    {
        var type = SellerType.Create("Alt", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.ExistsByNameAsync("Neu", type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _verkaeuferverwaltung.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(5);
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
