using Bazaar.Application.Settings;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Settings;
using Moq;
using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Application.UnitTests.Settings;

public class GetPrintTextsHandlerTests
{
    private readonly Mock<ISettingsRepository> _settingsRepository = new();

    [Fact]
    public async Task Handle_StoredTexts_ReturnsBothTextSets()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        settings.UpdatePrintTexts(
            new PrintTexts("a1", "a2", "a3", "a4", "a5"),
            new PrintTexts("v1", "v2", "v3", "v4", "v5"));
        _settingsRepository.Setup(r => r.Get()).ReturnsAsync(settings);
        var sut = new GetPrintTextsHandler(_settingsRepository.Object);

        // Act
        var result = await sut.Handle();

        // Assert
        Assert.Equal(new PrintTextsDto("a1", "a2", "a3", "a4", "a5"), result.AbgabeBeleg);
        Assert.Equal(new PrintTextsDto("v1", "v2", "v3", "v4", "v5"), result.VerkaeuferUebersicht);
    }
}
