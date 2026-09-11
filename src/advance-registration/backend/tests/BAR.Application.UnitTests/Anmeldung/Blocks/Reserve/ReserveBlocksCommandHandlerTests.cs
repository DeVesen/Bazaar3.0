using BAR.Modules.Anmeldung.Application.Blocks.Reserve;
using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Betrieb.Contracts;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.Blocks.Reserve;

public class ReserveBlocksCommandHandlerTests
{
    private static NumberingConfigDto Numbering() => new(StartNumber: 101, BlockSize: 10, DefaultBlockCount: 1);

    [Fact]
    public async Task HandleAsync_NoOverlap_ReservesRequestedBlocks()
    {
        var blocks = new Mock<INumberBlockRepository>();
        var betrieb = new Mock<IBetriebModuleApi>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        betrieb.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Numbering());
        var handler = new ReserveBlocksCommandHandler(blocks.Object, betrieb.Object);

        var result = await handler.HandleAsync(new ReserveBlocksCommand("seller-1", 101, 1), TestContext.Current.CancellationToken);

        Assert.Single(result);
        Assert.Equal(101, result[0].FromNumber);
        blocks.Verify(b => b.AddRangeAsync(It.Is<IReadOnlyList<NumberBlock>>(l => l.Count == 1), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_NoStartNumberGivenAndNoExistingBlocks_UsesNumberingStartNumber()
    {
        var blocks = new Mock<INumberBlockRepository>();
        var betrieb = new Mock<IBetriebModuleApi>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        betrieb.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Numbering());
        var handler = new ReserveBlocksCommandHandler(blocks.Object, betrieb.Object);

        var result = await handler.HandleAsync(new ReserveBlocksCommand("seller-1", null, 1), TestContext.Current.CancellationToken);

        Assert.Single(result);
        Assert.Equal(101, result[0].FromNumber);
    }

    [Fact]
    public async Task HandleAsync_NoStartNumberGivenAndExistingBlocksPresent_UsesAllocatorComputedStart()
    {
        var existingBlock = NumberBlock.Assign("seller-existing", 101, 10, DateTime.UtcNow);
        var blocks = new Mock<INumberBlockRepository>();
        var betrieb = new Mock<IBetriebModuleApi>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([existingBlock]);
        betrieb.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Numbering());
        var handler = new ReserveBlocksCommandHandler(blocks.Object, betrieb.Object);

        var expectedStart = NumberBlockAllocator.Allocate([existingBlock], "seller-1", 1, 101, 10, DateTime.UtcNow)[0].FromNumber;

        var result = await handler.HandleAsync(new ReserveBlocksCommand("seller-1", null, 1), TestContext.Current.CancellationToken);

        Assert.Single(result);
        Assert.Equal(expectedStart, result[0].FromNumber);
        Assert.Equal(111, result[0].FromNumber);
    }

    [Fact]
    public async Task HandleAsync_StartNumberBelowNumberingStartNumber_ThrowsBlockOverlap()
    {
        var blocks = new Mock<INumberBlockRepository>();
        var betrieb = new Mock<IBetriebModuleApi>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        betrieb.Setup(b => b.GetNumberingConfigAsync(It.IsAny<CancellationToken>())).ReturnsAsync(Numbering());
        var handler = new ReserveBlocksCommandHandler(blocks.Object, betrieb.Object);

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(new ReserveBlocksCommand("seller-1", 50, 1), TestContext.Current.CancellationToken));

        Assert.Equal("block.overlap", ex.ErrorCode);
        blocks.Verify(b => b.AddRangeAsync(It.IsAny<IReadOnlyList<NumberBlock>>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
