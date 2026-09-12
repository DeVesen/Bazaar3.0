using BAR.Modules.Registration.Contracts.Blocks;
using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Operations.Contracts;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Registration.Application.Blocks.Reserve;

public sealed class ReserveBlocksCommandHandler(INumberBlockRepository blocks, IOperationsModuleApi operations)
{
    public async Task<IReadOnlyList<BlockDto>> HandleAsync(ReserveBlocksCommand command, CancellationToken cancellationToken)
    {
        var numbering = await operations.GetNumberingConfigAsync(cancellationToken);

        // Validation cascade, stage 1 (api/blocks.md section 6): a start number
        // given by the admin must never fall below the configured bazaar
        // start number.
        if (command.StartNumber.HasValue && command.StartNumber.Value < numbering.StartNumber)
        {
            throw new ConflictException("block.overlap", "Nummernbereich überschneidet sich mit bestehendem Block");
        }

        var existing = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        var blockCount = command.BlockCount ?? numbering.DefaultBlockCount;
        var startNumber = command.StartNumber ?? (existing.Count == 0
            ? numbering.StartNumber
            : NumberBlockAllocator.Allocate(existing, command.SellerId, blockCount, numbering.StartNumber, numbering.BlockSize, DateTime.UtcNow)[0].FromNumber);

        var overlap = existing.Any(b => startNumber <= b.ToNumber && startNumber + (blockCount * numbering.BlockSize) - 1 >= b.FromNumber);
        if (overlap)
        {
            throw new ConflictException("block.overlap", "Nummernbereich überschneidet sich mit bestehendem Block");
        }

        var newBlocks = new List<NumberBlock>(blockCount);
        var next = startNumber;
        for (var i = 0; i < blockCount; i++)
        {
            newBlocks.Add(NumberBlock.Assign(command.SellerId, next, numbering.BlockSize, DateTime.UtcNow));
            next += numbering.BlockSize;
        }

        await blocks.AddRangeAsync(newBlocks, cancellationToken);

        return newBlocks.Select(b => new BlockDto(b.Id, b.SellerId, b.FromNumber, b.ToNumber, b.ToNumber - b.FromNumber + 1, 0, b.AssignedAt)).ToList();
    }
}
