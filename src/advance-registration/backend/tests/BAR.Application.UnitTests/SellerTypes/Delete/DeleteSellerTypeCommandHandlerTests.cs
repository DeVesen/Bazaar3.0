using BAR.Application.SellerTypes.Delete;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Settings;
using BAR.Domain.SellerTypes;
using Moq;

namespace BAR.Application.UnitTests.SellerTypes.Delete;

public class DeleteSellerTypeCommandHandlerTests
{
    private readonly Mock<ISellerTypeRepository> _types = new();
    private readonly Mock<ISettingsRepository> _settings = new();

    [Fact]
    public async Task HandleAsync_Unused_Deletes()
    {
        var type = SellerType.Create("Frei", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.CountSellersAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(0);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((Settings?)null);
        var handler = new DeleteSellerTypeCommandHandler(_types.Object, _settings.Object);

        await handler.HandleAsync(type.Id, TestContext.Current.CancellationToken);

        _types.Verify(t => t.DeleteAsync(type, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_InUse_ThrowsConflictAndDoesNotDelete()
    {
        var type = SellerType.Create("Belegt", 10m, 0.20m);
        _types.Setup(t => t.GetByIdAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(type);
        _types.Setup(t => t.CountSellersAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(3);
        var handler = new DeleteSellerTypeCommandHandler(_types.Object, _settings.Object);

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
        _types.Setup(t => t.CountSellersAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(0);
        var settings = Settings.Create(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, type.Id, null, 1, 100, 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);
        var handler = new DeleteSellerTypeCommandHandler(_types.Object, _settings.Object);

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
        _types.Setup(t => t.CountSellersAsync(type.Id, It.IsAny<CancellationToken>())).ReturnsAsync(1);
        var handler = new DeleteSellerTypeCommandHandler(_types.Object, _settings.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            handler.HandleAsync(type.Id, TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.in_use", ex.ErrorCode);
        _settings.Verify(s => s.GetAsync(It.IsAny<CancellationToken>()), Times.Never);
    }
}
