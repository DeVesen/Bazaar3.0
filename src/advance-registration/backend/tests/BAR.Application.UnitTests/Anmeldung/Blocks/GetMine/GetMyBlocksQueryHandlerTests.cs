using BAR.Modules.Anmeldung.Application.Blocks.GetMine;
using BAR.Modules.Anmeldung.Domain.NumberBlocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Anmeldung.Blocks.GetMine;

public class GetMyBlocksQueryHandlerTests
{
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IArticleRepository> _articles = new();

    private GetMyBlocksQueryHandler CreateHandler() => new(_blocks.Object, _articles.Object);

    [Fact]
    public async Task HandleAsync_SellerHasBlocks_ReturnsThemOrderedWithComputedCounts()
    {
        var block1 = NumberBlock.Assign("s1", 111, 10, DateTime.UtcNow);
        var block2 = NumberBlock.Assign("s1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetForSellerAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync([block1, block2]);
        _articles.Setup(a => a.CountInRangeForSellerAsync("s1", 101, 110, It.IsAny<CancellationToken>())).ReturnsAsync(3);

        var result = await CreateHandler().HandleAsync("s1", TestContext.Current.CancellationToken);

        Assert.Equal(2, result.Count);
        Assert.Equal(101, result[0].FromNumber);
        Assert.Equal(111, result[1].FromNumber);
        Assert.Equal(10, result[0].NumberCount);
        Assert.Equal(3, result[0].UsedCount);
    }

    [Fact]
    public async Task HandleAsync_NoBlocks_ReturnsEmptyList()
    {
        _blocks.Setup(b => b.GetForSellerAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync([]);

        var result = await CreateHandler().HandleAsync("s1", TestContext.Current.CancellationToken);

        Assert.Empty(result);
    }
}
