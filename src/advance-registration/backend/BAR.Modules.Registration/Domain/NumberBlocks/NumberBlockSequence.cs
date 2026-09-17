namespace BAR.Modules.Registration.Domain.NumberBlocks;

/// <summary>
/// Ascending numbers across all of a seller's blocks, own-range-membership
/// and Export/Template row generation share this instead of duplicating the
/// range expansion (blocks never overlap, enforced by a DB exclusion
/// constraint - see AddNumberBlockOverlapExclusion migration).
/// </summary>
public static class NumberBlockSequence
{
    public static IReadOnlyList<int> AllNumbersOrdered(IReadOnlyList<NumberBlock> blocks) =>
        blocks
            .OrderBy(b => b.FromNumber)
            .SelectMany(b => Enumerable.Range(b.FromNumber, b.ToNumber - b.FromNumber + 1))
            .ToList();
}
