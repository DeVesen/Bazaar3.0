namespace BAR.Domain.NumberBlocks;

/// <summary>
/// Vergabe-Kaskade Stufe 1-2 (api/blocks.md Abschnitt 5) fuer Selbstregistrierung:
/// ein neuer Verkaeufer hat noch keine eigenen Bloecke, darum entfaellt Stufe 1
/// (eigener freier Bereich). Freiheitspruefung Stufe 1-3 (Abschnitt 6) laeuft
/// hier; Stufe 4 (Exclusion-Constraint) sichert die Race Condition erst beim
/// Insert in BAR.Infrastructure ab.
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
            var overlap = occupied.FirstOrDefault(o => candidate <= o.ToNumber && candidateEnd >= o.FromNumber);

            if (overlap == default)
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

            candidate = overlap.ToNumber + 1;

            if (candidate > int.MaxValue - totalNeeded)
            {
                throw new NoFreeRangeException();
            }
        }
    }
}

/// <summary>Notfall-Pfad (api/blocks.md Abschnitt 5, Stufe 3) - im Normalbetrieb unerreichbar.</summary>
public sealed class NoFreeRangeException : Exception;
