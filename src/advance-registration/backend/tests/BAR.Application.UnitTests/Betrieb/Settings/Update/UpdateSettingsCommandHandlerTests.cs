using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Betrieb.Application.Settings.Update;
using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Betrieb.Domain.Ports;
using BAR.SharedKernel.Exceptions;
using DomainSettings = BAR.Modules.Betrieb.Domain.Settings;
using Moq;

namespace BAR.Application.UnitTests.Betrieb.Settings.Update;

public class UpdateSettingsCommandHandlerTests
{
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<IAnmeldungModuleApi> _anmeldung = new();

    private UpdateSettingsCommandHandler CreateHandler() => new(_settings.Object, _anmeldung.Object);

    private static UpdateSettingsCommand ValidCommand(DateTime now) =>
        new(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

    [Fact]
    public async Task HandleAsync_StartNumberBelowExistingArticle_ThrowsConflict()
    {
        _anmeldung.Setup(a => a.ExistsArticleNumberBelowAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            CreateHandler().HandleAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken));

        Assert.Equal("settings.start_number_conflict", ex.ErrorCode);
        _settings.Verify(s => s.SaveAsync(It.IsAny<DomainSettings>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_NoExistingRow_CreatesAndSaves()
    {
        _anmeldung.Setup(a => a.ExistsArticleNumberBelowAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((DomainSettings?)null);

        var result = await CreateHandler().HandleAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.StartNumber);
        _settings.Verify(s => s.SaveAsync(It.IsAny<DomainSettings>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ExistingRow_UpdatesInPlaceAndSaves()
    {
        var now = DateTime.UtcNow;
        var existing = DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", "Alt", 1, 10, 1);
        _anmeldung.Setup(a => a.ExistsArticleNumberBelowAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(existing);

        var result = await CreateHandler().HandleAsync(
            new UpdateSettingsCommand(now, now, now, now, now, "t9999999", "Neu", 2, 20, 3),
            TestContext.Current.CancellationToken);

        Assert.Equal("t9999999", result.DefaultTypeId);
        Assert.Equal("Neu", result.InfoText);
        _settings.Verify(s => s.SaveAsync(existing, It.IsAny<CancellationToken>()), Times.Once);
    }

    // Termine muessen aufsteigend sein und InfoText darf 4000 Zeichen nicht
    // ueberschreiten - beides erzwingt Settings.Create/Update selbst
    // (Domain.Validate), nicht mehr UpdateSettingsCommandValidator. Coverage
    // dafuer sitzt darum hier statt in UpdateSettingsCommandValidatorTests.
    [Fact]
    public async Task HandleAsync_DescendingDates_ThrowsArgumentException()
    {
        var now = DateTime.UtcNow;
        _anmeldung.Setup(a => a.ExistsArticleNumberBelowAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((DomainSettings?)null);
        var command = ValidCommand(now) with { DropOffFrom = now.AddDays(-1) };

        await Assert.ThrowsAsync<ArgumentException>(() =>
            CreateHandler().HandleAsync(command, TestContext.Current.CancellationToken));

        _settings.Verify(s => s.SaveAsync(It.IsAny<DomainSettings>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_InfoTextOverLimit_ThrowsArgumentException()
    {
        _anmeldung.Setup(a => a.ExistsArticleNumberBelowAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((DomainSettings?)null);
        var command = ValidCommand(DateTime.UtcNow) with { InfoText = new string('a', 4001) };

        await Assert.ThrowsAsync<ArgumentException>(() =>
            CreateHandler().HandleAsync(command, TestContext.Current.CancellationToken));
    }
}
