using BAR.Domain.Articles;
using BAR.Domain.NumberBlocks;

namespace BAR.Domain.UnitTests.Articles;

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
        var ownBlock = NumberBlock.Assign("s1", 101, 10, Now); // 101-110, komplett belegt
        var used = Enumerable.Range(101, 10).ToList();
        var otherBlock = NumberBlock.Assign("s2", 111, 10, Now); // 111-120 belegt anderer Verkaeufer
        var fillerBlock = NumberBlock.Assign("filler", 1, 100, Now); // 1-100 belegt, damit keine Luecke unterhalb 121 frei ist

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
        // Belegt lueckenlos von startNumber bis int.MaxValue in einem Block der Groesse blockSize=10,
        // sodass Stufe 2 keinen Platz mehr findet: ein einzelner Block, der bis kurz vor int.MaxValue reicht.
        var wallToWall = NumberBlock.Assign("other", 1, int.MaxValue - 1, Now);

        Assert.Throws<NoFreeRangeException>(() =>
            ArticleNumberAllocator.AllocateNext(
                sellerBlocks: [], usedNumbersInSellerBlocks: [], allBlocksGlobal: [wallToWall],
                sellerId: "s1", startNumber: 1, blockSize: 10, nowUtc: Now));
    }
}
