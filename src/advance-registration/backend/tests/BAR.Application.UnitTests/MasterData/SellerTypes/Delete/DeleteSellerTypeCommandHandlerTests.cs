using BAR.Modules.Operations.Contracts;
using BAR.Modules.MasterData.Application.SellerTypes.Delete;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.MasterData.Domain.SellerTypes;
using BAR.Modules.SellerManagement.Contracts;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.MasterData.SellerTypes.Delete;

public class DeleteSellerTypeCommandHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _types = new();
    private readonly Mock<ISellerManagementModuleApi> _sellerManagement = new();
    private readonly Mock<IOperationsModuleApi> _operations = new();

    private DeleteSellerTypeCommandHandler CreateHandler() => new(_types.Object, _sellerManagement.Object, _operations.Object);

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var type = SellerType.Create("Frei", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _sellerManagement.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(0);
        _operations.Setup(b => b.IsDefaultSellerTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(false);
        var handler = CreateHandler();

        await handler.HandleAsync(type.Id, TestContext.Current.CancellationToken);

        _types.Verify(t => t.DeleteAsync(type, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var type = SellerType.Create("Belegt", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _sellerManagement.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(3);
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
        _sellerManagement.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(0);
        _operations.Setup(b => b.IsDefaultSellerTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(true);
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
        _sellerManagement.Setup(v => v.CountSellersByTypeAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(1);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.in_use", ex.ErrorCode);
        _operations.Verify(b => b.IsDefaultSellerTypeAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
