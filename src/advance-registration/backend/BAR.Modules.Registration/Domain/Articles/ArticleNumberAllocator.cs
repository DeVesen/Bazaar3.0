using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Modules.Registration.Domain.Articles;

public sealed record ArticleNumberAllocation(int Number, NumberBlock? NewBlock);

/// <summary>
/// Allocation cascade stages 1-3 (api/blocks.md section 5) for
/// POST /api/articles and GET /api/articles/next-number. Stage 2 delegates to
/// NumberBlockAllocator (already in place for self-registration/admin
/// creation) instead of duplicating the overlap search.
/// </summary>
public static class ArticleNumberAllocator
{
    public static ArticleNumberAllocation AllocateNext(
        IReadOnlyList<NumberBlock> sellerBlocks,
        IReadOnlyList<int> usedNumbersInSellerBlocks,
        IReadOnlyList<NumberBlock> allBlocksGlobal,
        string sellerId, int startNumber, int blockSize, DateTime nowUtc)
    {
        var used = usedNumbersInSellerBlocks.ToHashSet();

        foreach (var block in sellerBlocks.OrderBy(b => b.FromNumber))
        {
            for (var n = block.FromNumber; n <= block.ToNumber; n++)
            {
                if (!used.Contains(n))
                {
                    return new ArticleNumberAllocation(n, NewBlock: null);
                }
            }
        }

        var newBlocks = NumberBlockAllocator.Allocate(
            allBlocksGlobal, sellerId, blockCount: 1, startNumber, blockSize, nowUtc);
        var newBlock = newBlocks[0];

        return new ArticleNumberAllocation(newBlock.FromNumber, newBlock);
    }
}
