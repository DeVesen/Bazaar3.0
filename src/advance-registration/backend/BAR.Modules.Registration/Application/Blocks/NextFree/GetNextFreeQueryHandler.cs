using BAR.Modules.Registration.Contracts.Blocks;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Operations.Contracts;

namespace BAR.Modules.Registration.Application.Blocks.NextFree;

public sealed class GetNextFreeQueryHandler(INumberBlockRepository blocks, IOperationsModuleApi operations)
{
    public async Task<NextFreeResultDto> HandleAsync(int blockCount, CancellationToken cancellationToken)
    {
        var numbering = await operations.GetNumberingConfigAsync(cancellationToken);
        var existing = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        // Dry run: the same allocator as for every other allocation (api/blocks.md
        // section 5/6) - the result is only read, never persisted. sellerId/nowUtc
        // are irrelevant for a mere preview.
        var proposal = NumberBlockAllocator.Allocate(existing, "preview", blockCount, numbering.StartNumber, numbering.BlockSize, DateTime.UtcNow);
        return new NextFreeResultDto(proposal[0].FromNumber);
    }
}
