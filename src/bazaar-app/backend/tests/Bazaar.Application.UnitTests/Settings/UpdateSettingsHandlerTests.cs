using Bazaar.Application.Settings;
using Bazaar.Domain.Ports;
using Moq;

using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Application.UnitTests.Settings;

public class UpdateSettingsHandlerTests
{
    private readonly Mock<ISettingsRepository> _settingsRepository = new();

    private UpdateSettingsHandler CreateSut() =>
        new(_settingsRepository.Object);

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
}
