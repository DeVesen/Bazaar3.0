using Bazaar.Application.Settings;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.SellerTypes;
using Moq;

using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Application.UnitTests.Settings;

public class UpdateSettingsHandlerTests
{
    private readonly Mock<ISettingsRepository> _settingsRepository = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypeRepository = new();

    private UpdateSettingsHandler CreateSut() =>
        new(_settingsRepository.Object, _sellerTypeRepository.Object);

    [Fact]
    public async Task Handle_ValidCommand_UpdatesSettingsViaRepository()
    {
        var settings = SettingsAggregate.Create(3000);
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        var sut = CreateSut();

        await sut.Handle(new UpdateSettingsCommand { ScannerPauseMs = 5000 });

        Assert.Equal(5000, settings.ScannerPauseMs);
        _settingsRepository.Verify(r => r.Update(settings), Times.Once);
    }

    [Fact]
    public async Task Handle_ValidCommand_UpdatesSameAggregateInstanceReturnedByGet()
    {
        var settings = SettingsAggregate.Create(3000);
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        var sut = CreateSut();

        await sut.Handle(new UpdateSettingsCommand { ScannerPauseMs = 1000 });

        _settingsRepository.Verify(r => r.Update(It.Is<SettingsAggregate>(s => ReferenceEquals(s, settings))), Times.Once);
    }

    [Fact]
    public async Task Handle_ReleaseOnCloseDisabled_StoresFlagOnSettings()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        var sut = CreateSut();

        // Act
        await sut.Handle(new UpdateSettingsCommand { ScannerPauseMs = 3000, ReleaseOnClose = false });

        // Assert
        Assert.False(settings.ReleaseOnClose);
    }

    [Fact]
    public async Task Handle_ReleaseOnCloseOmitted_KeepsReleaseOnCloseEnabled()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        var sut = CreateSut();

        // Act
        await sut.Handle(new UpdateSettingsCommand { ScannerPauseMs = 3000 });

        // Assert
        Assert.True(settings.ReleaseOnClose);
    }

    [Fact]
    public async Task Handle_KnownDefaultSellerType_StoresDefaultSellerType()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        _sellerTypeRepository.Setup(r => r.GetById("TYPE0001"))
            .ReturnsAsync(SellerType.Create("TYPE0001", "Privat", 10m, 0.5m));
        var sut = CreateSut();

        // Act
        await sut.Handle(new UpdateSettingsCommand { ScannerPauseMs = 3000, DefaultSellerTypeId = "TYPE0001" });

        // Assert
        Assert.Equal("TYPE0001", settings.DefaultSellerTypeId);
    }

    [Fact]
    public async Task Handle_DefaultSellerTypeOmitted_ClearsDefaultSellerType()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        settings.ChangeDefaultSellerType("TYPE0001");
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        var sut = CreateSut();

        // Act
        await sut.Handle(new UpdateSettingsCommand { ScannerPauseMs = 3000 });

        // Assert
        Assert.Null(settings.DefaultSellerTypeId);
    }

    [Fact]
    public async Task Handle_UnknownDefaultSellerType_ThrowsNotFoundAndDoesNotUpdate()
    {
        // Arrange
        _sellerTypeRepository.Setup(r => r.GetById("UNKNOWN1")).ReturnsAsync((SellerType?)null);
        var sut = CreateSut();

        // Act
        var exception = await Assert.ThrowsAsync<NotFoundException>(() =>
            sut.Handle(new UpdateSettingsCommand { ScannerPauseMs = 3000, DefaultSellerTypeId = "UNKNOWN1" }));

        // Assert
        Assert.Equal("seller_type.not_found", exception.ErrorCode);
        _settingsRepository.Verify(r => r.Update(It.IsAny<SettingsAggregate>()), Times.Never);
    }
}
