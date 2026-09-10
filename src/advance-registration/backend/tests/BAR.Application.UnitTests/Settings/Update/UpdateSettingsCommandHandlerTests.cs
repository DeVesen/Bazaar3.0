using BAR.Application.Settings.Update;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Settings.Update;

public class UpdateSettingsCommandHandlerTests
{
    private readonly Mock<ISettingsRepository> _settings = new();
    private readonly Mock<IArticleRepository> _articles = new();

    private UpdateSettingsCommandHandler CreateHandler() => new(_settings.Object, _articles.Object);

    private static UpdateSettingsCommand ValidCommand(DateTime now) =>
        new(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

    [Fact]
    public async Task HandleAsync_StartNumberBelowExistingArticle_ThrowsConflict()
    {
        _articles.Setup(a => a.ExistsNumberBelowAsync(1, It.IsAny<CancellationToken>())).ReturnsAsync(true);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            CreateHandler().HandleAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken));

        Assert.Equal("settings.start_number_conflict", ex.ErrorCode);
        _settings.Verify(s => s.SaveAsync(It.IsAny<Domain.Settings.Settings>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_NoExistingRow_CreatesAndSaves()
    {
        _articles.Setup(a => a.ExistsNumberBelowAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync((Domain.Settings.Settings?)null);

        var result = await CreateHandler().HandleAsync(ValidCommand(DateTime.UtcNow), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.StartNumber);
        _settings.Verify(s => s.SaveAsync(It.IsAny<Domain.Settings.Settings>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ExistingRow_UpdatesInPlaceAndSaves()
    {
        var now = DateTime.UtcNow;
        var existing = Domain.Settings.Settings.Create(now, now, now, now, now, "t1b2c3d4", "Alt", 1, 10, 1);
        _articles.Setup(a => a.ExistsNumberBelowAsync(It.IsAny<int>(), It.IsAny<CancellationToken>())).ReturnsAsync(false);
        _settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(existing);

        var result = await CreateHandler().HandleAsync(
            new UpdateSettingsCommand(now, now, now, now, now, "t9999999", "Neu", 2, 20, 3),
            TestContext.Current.CancellationToken);

        Assert.Equal("t9999999", result.DefaultTypeId);
        Assert.Equal("Neu", result.InfoText);
        _settings.Verify(s => s.SaveAsync(existing, It.IsAny<CancellationToken>()), Times.Once);
    }
}
