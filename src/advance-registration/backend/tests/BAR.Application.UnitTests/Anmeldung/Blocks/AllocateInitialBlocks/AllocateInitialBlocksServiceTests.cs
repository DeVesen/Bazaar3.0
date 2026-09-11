using BAR.Modules.Anmeldung.Application.Blocks;
using BAR.Modules.Anmeldung.Domain.Exceptions;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Betrieb.Contracts;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.Blocks.AllocateInitialBlocks;

/// <summary>
/// Retry-bei-Overlap-Logik, die frueher inline in RegisterCommandHandler und
/// CreateSellerCommandHandler getestet wurde - jetzt konsolidiert hier, siehe
/// AllocateInitialBlocksService-Kommentar.
/// </summary>
public class AllocateInitialBlocksServiceTests
{
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IBetriebModuleApi> _betrieb = new();
    private readonly Mock<IClock> _clock = new();

    private AllocateInitialBlocksService CreateService() => new(_blocks.Object, _betrieb.Object, _clock.Object);

    private void SetUpNumbering(int startNumber = 1, int blockSize = 10, int defaultBlockCount = 1) =>
        _betrieb.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(new NumberingConfigDto(startNumber, blockSize, defaultBlockCount));

    [Fact]
    public async Task HandleAsync_NoOverlap_AllocatesAndInsertsOnce()
    {
        SetUpNumbering();
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);

        var result = await CreateService().HandleAsync("s1", blockCount: null, startNumber: null, TestContext.Current.CancellationToken);

        Assert.Single(result);
        Assert.Equal(1, result[0].FromNumber);
        _blocks.Verify(b => b.AddRangeAsync(It.IsAny<IReadOnlyList<NumberBlock>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_StartNumberBelowNumberingStartNumber_ThrowsBlockOverlap()
    {
        SetUpNumbering(startNumber: 101);

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            CreateService().HandleAsync("s1", blockCount: 1, startNumber: 50, TestContext.Current.CancellationToken));

        Assert.Equal("block.overlap", ex.ErrorCode);
        _blocks.Verify(b => b.AddRangeAsync(It.IsAny<IReadOnlyList<NumberBlock>>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_OverlapOnFirstAttempt_RetriesOnceAndSucceeds()
    {
        SetUpNumbering();
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);
        var attempts = 0;
        _blocks
            .Setup(b => b.AddRangeAsync(It.IsAny<IReadOnlyList<NumberBlock>>(), It.IsAny<CancellationToken>()))
            .Returns(() =>
            {
                attempts++;
                return attempts == 1 ? throw new NumberBlockOverlapException("belegt") : Task.CompletedTask;
            });

        var result = await CreateService().HandleAsync("s1", blockCount: null, startNumber: null, TestContext.Current.CancellationToken);

        Assert.Single(result);
        Assert.Equal(2, attempts);
        // Der zweite Versuch liest den Bestand neu, statt die veraltete Liste
        // ein zweites Mal zu verwenden.
        _blocks.Verify(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>()), Times.Exactly(2));
    }

    [Fact]
    public async Task HandleAsync_OverlapTwice_ThrowsConflictInsteadOfBubblingUp()
    {
        SetUpNumbering();
        _blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);
        _blocks
            .Setup(b => b.AddRangeAsync(It.IsAny<IReadOnlyList<NumberBlock>>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new NumberBlockOverlapException("belegt"));

        var ex = await Assert.ThrowsAsync<ConflictException>(() =>
            CreateService().HandleAsync("s1", blockCount: null, startNumber: null, TestContext.Current.CancellationToken));

        Assert.Equal("block.overlap", ex.ErrorCode);
        _blocks.Verify(b => b.AddRangeAsync(It.IsAny<IReadOnlyList<NumberBlock>>(), It.IsAny<CancellationToken>()), Times.Exactly(2));
    }
}
