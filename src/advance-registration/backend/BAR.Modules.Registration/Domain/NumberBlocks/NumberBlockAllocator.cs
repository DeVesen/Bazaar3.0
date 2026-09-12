using BAR.Modules.Registration.Domain.Exceptions;

namespace BAR.Modules.Registration.Domain.NumberBlocks;

/// <summary>
/// Allocation cascade stages 1-2 (api/blocks.md section 5) for
/// self-registration: a new seller has no blocks of their own yet, so stage 1
/// (own free range) is skipped. The freeness check for stages 1-3
/// (section 6) runs here; stage 4 (exclusion constraint) only guards against
/// the race condition on insert in Infrastructure.
/// </summary>
public static class NumberBlockAllocator
{
    public static IReadOnlyList<NumberBlock> Allocate(
        IReadOnlyList<NumberBlock> existingBlocks, string sellerId, int blockCount,
        int startNumber, int blockSize, DateTime nowUtc)
    {
        var occupied = existingBlocks
            .OrderBy(b => b.FromNumber)
            .Select(b => (b.FromNumber, b.ToNumber))
            .ToList();

        var totalNeeded = blockCount * blockSize;
        var candidate = startNumber;

        while (true)
        {
            var candidateEnd = candidate + totalNeeded - 1;
            var hasOverlap = occupied.Any(o => candidate <= o.ToNumber && candidateEnd >= o.FromNumber);

            if (!hasOverlap)
            {
                var blocks = new List<NumberBlock>(blockCount);
                var next = candidate;
                for (var i = 0; i < blockCount; i++)
                {
                    blocks.Add(NumberBlock.Assign(sellerId, next, blockSize, nowUtc));
                    next += blockSize;
                }

                return blocks;
            }

            var overlap = occupied.First(o => candidate <= o.ToNumber && candidateEnd >= o.FromNumber);

            // Check for overflow BEFORE attempting the addition that could wrap.
            if (overlap.ToNumber > int.MaxValue - totalNeeded)
            {
                throw new NoFreeRangeException();
            }

            candidate = overlap.ToNumber + 1;
        }
    }
}
