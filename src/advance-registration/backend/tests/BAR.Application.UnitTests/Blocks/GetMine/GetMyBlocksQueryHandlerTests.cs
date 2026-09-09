using BAR.Application.Blocks.GetMine;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Blocks.GetMine;

public class GetMyBlocksQueryHandlerTests
{
    private readonly Mock<INumberBlockRepository> _blocks = new();

    [Fact]
    public async Task HandleAsync_SellerHasBlocks_ReturnsThemOrderedWithComputedCounts()
    {
        var block1 = NumberBlock.Assign("s1", 111, 10, DateTime.UtcNow);
        var block2 = NumberBlock.Assign("s1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetForSellerAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync([block1, block2]);
        var handler = new GetMyBlocksQueryHandler(_blocks.Object);

        var result = await handler.HandleAsync("s1", TestContext.Current.CancellationToken);

        Assert.Equal(2, result.Count);
        Assert.Equal(101, result[0].FromNumber);
        Assert.Equal(111, result[1].FromNumber);
        Assert.Equal(10, result[0].NumberCount);
        Assert.Equal(0, result[0].UsedCount);
    }

    [Fact]
    public async Task HandleAsync_NoBlocks_ReturnsEmptyList()
    {
        _blocks.Setup(b => b.GetForSellerAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync([]);
        var handler = new GetMyBlocksQueryHandler(_blocks.Object);

        var result = await handler.HandleAsync("s1", TestContext.Current.CancellationToken);

        Assert.Empty(result);
    }
}
