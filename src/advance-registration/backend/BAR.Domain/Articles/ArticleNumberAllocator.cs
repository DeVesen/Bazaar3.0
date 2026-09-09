namespace BAR.Domain.Articles;

public sealed record ArticleNumberAllocation(int Number, NumberBlocks.NumberBlock? NewBlock);

/// <summary>
/// Vergabe-Kaskade Stufe 1-3 (api/blocks.md Abschnitt 5) fuer POST /api/articles
/// und GET /api/articles/next-number. Stufe 2 delegiert an NumberBlockAllocator
/// (bereits vorhanden fuer Selbstregistrierung/Admin-Anlage) statt die
/// Ueberschneidungs-Suche zu duplizieren.
/// </summary>
public static class ArticleNumberAllocator
{
    public static ArticleNumberAllocation AllocateNext(
        IReadOnlyList<NumberBlocks.NumberBlock> sellerBlocks,
        IReadOnlyList<int> usedNumbersInSellerBlocks,
        IReadOnlyList<NumberBlocks.NumberBlock> allBlocksGlobal,
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

        var newBlocks = NumberBlocks.NumberBlockAllocator.Allocate(
            allBlocksGlobal, sellerId, blockCount: 1, startNumber, blockSize, nowUtc);
        var newBlock = newBlocks[0];

        return new ArticleNumberAllocation(newBlock.FromNumber, newBlock);
    }
}
