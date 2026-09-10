using BAR.Application.Blocks.Reserve;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Settings;
using Moq;

namespace BAR.Application.UnitTests.Blocks.Reserve;

public class ReserveBlocksCommandHandlerTests
{
    [Fact]
    public async Task HandleAsync_NoOverlap_ReservesRequestedBlocks()
    {
        var blocks = new Mock<INumberBlockRepository>();
        var settings = new Mock<ISettingsRepository>();
        blocks.Setup(b => b.GetAllOrderedByFromNumberAsync(It.IsAny<CancellationToken>())).ReturnsAsync([]);
        settings.Setup(s => s.GetAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            Settings.Create(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, "t1", null, 101, 10, 1));
        var handler = new ReserveBlocksCommandHandler(blocks.Object, settings.Object);

        var result = await handler.HandleAsync(new ReserveBlocksCommand("seller-1", 101, 1), TestContext.Current.CancellationToken);

        Assert.Single(result);
        Assert.Equal(101, result[0].FromNumber);
        blocks.Verify(b => b.AddRangeAsync(It.Is<IReadOnlyList<NumberBlock>>(l => l.Count == 1), It.IsAny<CancellationToken>()), Times.Once);
    }
}
