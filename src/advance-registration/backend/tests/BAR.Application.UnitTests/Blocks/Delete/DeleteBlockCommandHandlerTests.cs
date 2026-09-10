using BAR.Application.Blocks.Delete;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using Moq;

namespace BAR.Application.UnitTests.Blocks.Delete;

public class DeleteBlockCommandHandlerTests
{
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IArticleRepository> _articles = new();

    [Fact]
    public async Task HandleAsync_BlockBelongsToSeller_Deletes()
    {
        var block = NumberBlock.Assign("seller-1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetByIdAsync(block.Id, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        _articles.Setup(a => a.CountInRangeForSellerAsync(block.SellerId, block.FromNumber, block.ToNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync(0);
        var handler = new DeleteBlockCommandHandler(_blocks.Object, _articles.Object);

        await handler.HandleAsync(new DeleteBlockCommand("seller-1", block.Id), TestContext.Current.CancellationToken);

        _blocks.Verify(b => b.DeleteAsync(block, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_BlockBelongsToDifferentSeller_ThrowsNotFound()
    {
        var block = NumberBlock.Assign("seller-1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetByIdAsync(block.Id, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        var handler = new DeleteBlockCommandHandler(_blocks.Object, _articles.Object);

        await Assert.ThrowsAsync<BAR.Domain.Exceptions.NotFoundException>(
            () => handler.HandleAsync(new DeleteBlockCommand("seller-2", block.Id), TestContext.Current.CancellationToken));
    }

    [Fact]
    public async Task HandleAsync_BlockHasUsedNumbers_ThrowsConflict()
    {
        var block = NumberBlock.Assign("seller-1", 101, 10, DateTime.UtcNow);
        _blocks.Setup(b => b.GetByIdAsync(block.Id, It.IsAny<CancellationToken>())).ReturnsAsync(block);
        _articles.Setup(a => a.CountInRangeForSellerAsync(block.SellerId, block.FromNumber, block.ToNumber, It.IsAny<CancellationToken>()))
            .ReturnsAsync(3);
        var handler = new DeleteBlockCommandHandler(_blocks.Object, _articles.Object);

        var exception = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(
            () => handler.HandleAsync(new DeleteBlockCommand("seller-1", block.Id), TestContext.Current.CancellationToken));

        Assert.Equal("block.in_use", exception.ErrorCode);
    }
}
