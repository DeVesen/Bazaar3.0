using BAR.Application.Blocks.GetMine;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Blocks.GetMine;

public class GetMyBlocksQueryHandlerTests
{
    private readonly Mock<INumberBlockRepository> _blocks = new();

    [Fact]
    public async Task HandleAsync_SellerHasBlocks_ReturnsThem()
    {
        var block = NumberBlock.Assign("s1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetForSellerAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync([block]);
        var handler = new GetMyBlocksQueryHandler(_blocks.Object);

        var result = await handler.HandleAsync("s1", TestContext.Current.CancellationToken);

        Assert.Single(result);
        Assert.Equal(101, result[0].FromNumber);
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
