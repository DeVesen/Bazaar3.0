using BAR.Modules.Betrieb.Application.Settings.GetSettings;
using BAR.Modules.Betrieb.Domain.Ports;
using DomainSettings = BAR.Modules.Betrieb.Domain.Settings;
using Moq;

namespace BAR.Application.UnitTests.Betrieb.Settings.GetSettings;

public class GetSettingsQueryHandlerTests
{
    private readonly Mock<ISettingsRepository> _settings = new();

    private GetSettingsQueryHandler CreateHandler() => new(_settings.Object);

    [Fact]
    public async Task HandleAsync_NoRow_ReturnsNull()
    {
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((DomainSettings?)null);

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Null(result);
    }

    [Fact]
    public async Task HandleAsync_ExistingRow_ReturnsValues()
    {
        var now = DateTime.UtcNow;
        var settings = DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);

        var result = await CreateHandler().HandleAsync(TestContext.Current.CancellationToken);

        Assert.Equal(now, result!.RegistrationDeadline);
        Assert.Equal("t1b2c3d4", result.DefaultTypeId);
        Assert.Equal(1, result.StartNumber);
        Assert.Equal(10, result.BlockSize);
        Assert.Equal(1, result.DefaultBlockCount);
    }
}
