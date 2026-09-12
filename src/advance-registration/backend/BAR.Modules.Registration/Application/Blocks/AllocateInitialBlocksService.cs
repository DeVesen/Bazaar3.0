using BAR.Modules.Registration.Domain.Exceptions;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Operations.Contracts;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Registration.Application.Blocks;

/// <summary>
/// Consolidates the retry-on-overlap logic previously duplicated in
/// RegisterCommandHandler and CreateSellerCommandHandler - both called the
/// same allocator with the same retry rule. Now the single place where
/// SellerManagement requests number blocks for a new seller via
/// Registration.Contracts.
/// </summary>
public sealed class AllocateInitialBlocksService(INumberBlockRepository blocks, IOperationsModuleApi operations, IClock clock)
{
    public async Task<IReadOnlyList<NumberBlock>> HandleAsync(
        string sellerId, int? blockCount, int? startNumber, CancellationToken cancellationToken)
    {
        var numbering = await operations.GetNumberingConfigAsync(cancellationToken);

        // Check cascade stage 1 (api/blocks.md section 6): a given start
        // number may never fall below the configured bazaar start number.
        if (startNumber.HasValue && startNumber.Value < numbering.StartNumber)
        {
            throw new ConflictException("block.overlap", "Nummernbereich überschneidet sich mit bestehendem Block");
        }

        var effectiveStart = startNumber ?? numbering.StartNumber;
        var effectiveCount = blockCount ?? numbering.DefaultBlockCount;

        // Two concurrent creations can compute the same free range - the
        // second attempt then hits the EXCLUDE constraint. This exact case is
        // retried once (with freshly read data); if that also fails, it stays
        // a clean 409 instead of a raw 500.
        try
        {
            return await AllocateAndInsertAsync(sellerId, effectiveCount, effectiveStart, numbering.BlockSize, cancellationToken);
        }
        catch (NumberBlockOverlapException)
        {
            try
            {
                return await AllocateAndInsertAsync(sellerId, effectiveCount, effectiveStart, numbering.BlockSize, cancellationToken);
            }
            catch (NumberBlockOverlapException)
            {
                throw new ConflictException(
                    "block.overlap", "Nummernvergabe momentan ueberlastet, bitte erneut versuchen");
            }
        }
    }

    private async Task<IReadOnlyList<NumberBlock>> AllocateAndInsertAsync(
        string sellerId, int blockCount, int startNumber, int blockSize, CancellationToken cancellationToken)
    {
        var existingBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);
        var newBlocks = NumberBlockAllocator.Allocate(existingBlocks, sellerId, blockCount, startNumber, blockSize, clock.UtcNow);
        await blocks.AddRangeAsync(newBlocks, cancellationToken);
        return newBlocks;
    }
}
