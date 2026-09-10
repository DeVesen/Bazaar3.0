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

/// <summary>Notfall-Pfad (api/blocks.md Abschnitt 5, Stufe 3) - im Normalbetrieb unerreichbar -> 409.</summary>
public sealed class NoFreeRangeException()
    : BAR.Domain.Exceptions.ConflictException("block.no_free_range", "Kein zusammenhängender freier Nummernbereich verfügbar");
