using Bazaar.Application.Settings;
using Bazaar.Domain.Ports;
using Moq;
using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Application.UnitTests.Settings;

public class GetSettingsHandlerTests
{
    private readonly Mock<ISettingsRepository> _settingsRepository = new();

    private GetSettingsHandler CreateSut() =>
        new(_settingsRepository.Object);

    [Fact]
    public async Task Handle_FreshSettings_ReturnsReleaseOnCloseEnabled()
    {
        // Arrange
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(SettingsAggregate.Create(3000));
        var sut = CreateSut();

        // Act
        var result = await sut.Handle();

        // Assert
        Assert.Equal(new SettingsResponse(3000, true), result);
    }

    [Fact]
    public async Task Handle_ReleaseOnCloseDisabled_ReturnsStoredValues()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        settings.Update(4500, false);
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        var sut = CreateSut();

        // Act
        var result = await sut.Handle();

        // Assert
        Assert.Equal(new SettingsResponse(4500, false), result);
    }
}
