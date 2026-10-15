using Bazaar.Application.Settings;
using Bazaar.Domain.Ports;
using Moq;
using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Application.UnitTests.Settings;

public class UpdatePrintTextsHandlerTests
{
    private readonly Mock<ISettingsRepository> _settingsRepository = new();

    [Fact]
    public async Task Handle_ValidCommand_UpdatesPrintTextsViaRepository()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        var sut = new UpdatePrintTextsHandler(_settingsRepository.Object);
        var command = new UpdatePrintTextsCommand
        {
            AbgabeBeleg = new PrintTextsDto("a1", "a2", "a3", "a4", "a5"),
            VerkaeuferUebersicht = new PrintTextsDto("v1", "v2", "v3", "v4", "v5")
        };

        // Act
        await sut.Handle(command);

        // Assert
        Assert.Equal("a3", settings.AbgabeBeleg.Text3);
        Assert.Equal("v5", settings.VerkaeuferUebersicht.Text5);
        _settingsRepository.Verify(r => r.Update(settings), Times.Once);
    }

    [Fact]
    public async Task Handle_ValidCommand_KeepsScannerPauseMs()
    {
        // Arrange
        var settings = SettingsAggregate.Create(4200);
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        var sut = new UpdatePrintTextsHandler(_settingsRepository.Object);
        var command = new UpdatePrintTextsCommand
        {
            AbgabeBeleg = new PrintTextsDto("", "", "", "", ""),
            VerkaeuferUebersicht = new PrintTextsDto("", "", "", "", "")
        };

        // Act
        await sut.Handle(command);

        // Assert
        Assert.Equal(4200, settings.ScannerPauseMs);
    }
}
