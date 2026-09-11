using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Stammdaten.Application.SellerTypes.Delete;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.Modules.Stammdaten.Domain.SellerTypes;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Stammdaten.SellerTypes.Delete;

public class DeleteSellerTypeCommandHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _types = new();
    private readonly Mock<IVerkaeuferverwaltungModuleApi> _verkaeuferverwaltung = new();
    private readonly Mock<IBetriebModuleApi> _betrieb = new();

    private DeleteSellerTypeCommandHandler CreateHandler() => new(_types.Object, _verkaeuferverwaltung.Object, _betrieb.Object);

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var type = SellerType.Create("Frei", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _verkaeuferverwaltung.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(0);
        _betrieb.Setup(b => b.IsDefaultSellerTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = CreateHandler();

        await handler.HandleAsync(type.Id, TestContext.Current.CancellationToken);

        _types.Verify(t => t.DeleteAsync(type, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var type = SellerType.Create("Belegt", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _verkaeuferverwaltung.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(3);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.in_use", ex.ErrorCode);
        _types.Verify(t => t.DeleteAsync(It.IsAny<SellerType>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_IsDefaultType_ThrowsConflictAndDoesNotDelete()
    {
        var type = SellerType.Create("Default", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _verkaeuferverwaltung.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(0);
        _betrieb.Setup(b => b.IsDefaultSellerTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.is_default", ex.ErrorCode);
        _types.Verify(t => t.DeleteAsync(It.IsAny<SellerType>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_InUseAndDefault_ChecksInUseFirst()
    {
        var type = SellerType.Create("Beides", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _verkaeuferverwaltung.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(1);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.in_use", ex.ErrorCode);
        _betrieb.Verify(b => b.IsDefaultSellerTypeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
