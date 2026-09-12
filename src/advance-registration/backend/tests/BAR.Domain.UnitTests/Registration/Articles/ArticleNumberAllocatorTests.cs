using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.Exceptions;
using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Domain.UnitTests.Registration.Articles;

public class ArticleNumberAllocatorTests
{
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void AllocateNext_FreeNumberInOwnBlock_ReturnsSmallestFreeNumber_NoNewBlock()
    {
        var block = NumberBlock.Assign("s1", 101, 10, Now); // 101-110
        var used = new List<int> { 101, 102, 104 };

        var result = ArticleNumberAllocator.AllocateNext(
            sellerBlocks: [block], usedNumbersInSellerBlocks: used, allBlocksGlobal: [block],
            sellerId: "s1", startNumber: 1, blockSize: 10, nowUtc: Now);

        Assert.Equal(103, result.Number);
        Assert.Null(result.NewBlock);
    }

    [Fact]
    public void AllocateNext_OwnBlocksFull_AllocatesNewBlockGlobalFreeSpace()
    {
        var ownBlock = NumberBlock.Assign("s1", 101, 10, Now); // 101-110, completely used
        var used = Enumerable.Range(101, 10).ToList();
        var otherBlock = NumberBlock.Assign("s2", 111, 10, Now); // 111-120 used by a different seller
        var fillerBlock = NumberBlock.Assign("filler", 1, 100, Now); // 1-100 used, so no gap below 121 is free

        var result = ArticleNumberAllocator.AllocateNext(
            sellerBlocks: [ownBlock], usedNumbersInSellerBlocks: used, allBlocksGlobal: [fillerBlock, ownBlock, otherBlock],
            sellerId: "s1", startNumber: 1, blockSize: 10, nowUtc: Now);

        Assert.Equal(121, result.Number);
        Assert.NotNull(result.NewBlock);
        Assert.Equal("s1", result.NewBlock!.SellerId);
        Assert.Equal(121, result.NewBlock.FromNumber);
        Assert.Equal(130, result.NewBlock.ToNumber);
    }

    [Fact]
    public void AllocateNext_NoOwnBlocks_AllocatesFirstBlockFromStartNumber()
    {
        var result = ArticleNumberAllocator.AllocateNext(
            sellerBlocks: [], usedNumbersInSellerBlocks: [], allBlocksGlobal: [],
            sellerId: "s1", startNumber: 1, blockSize: 10, nowUtc: Now);

        Assert.Equal(1, result.Number);
        Assert.NotNull(result.NewBlock);
        Assert.Equal(1, result.NewBlock!.FromNumber);
    }

    [Fact]
    public void AllocateNext_NoFreeRangeGlobally_ThrowsNoFreeRangeException()
    {
        // Filled seamlessly from startNumber to int.MaxValue in a single block of size blockSize=10,
        // so that stage 2 finds no more room: a single block reaching to just short of int.MaxValue.
        var wallToWall = NumberBlock.Assign("other", 1, int.MaxValue - 1, Now);

        Assert.Throws<NoFreeRangeException>(() =>
            ArticleNumberAllocator.AllocateNext(
                sellerBlocks: [], usedNumbersInSellerBlocks: [], allBlocksGlobal: [wallToWall],
                sellerId: "s1", startNumber: 1, blockSize: 10, nowUtc: Now));
    }
}
