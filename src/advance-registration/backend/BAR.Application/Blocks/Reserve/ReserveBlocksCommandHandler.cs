using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;

namespace BAR.Application.Blocks.Reserve;

public sealed class ReserveBlocksCommandHandler(INumberBlockRepository blocks, ISettingsRepository settingsRepository)
{
    public async Task<IReadOnlyList<BlockResponse>> HandleAsync(ReserveBlocksCommand command, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new BAR.Domain.Exceptions.ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");
        var existing = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        var blockCount = command.BlockCount ?? settings.DefaultBlockCount;
        var startNumber = command.StartNumber ?? (existing.Count == 0
            ? settings.StartNumber
            : NumberBlockAllocator.Allocate(existing, command.SellerId, blockCount, settings.StartNumber, settings.BlockSize, DateTime.UtcNow)[0].FromNumber);

        var overlap = existing.Any(b => startNumber <= b.ToNumber && startNumber + (blockCount * settings.BlockSize) - 1 >= b.FromNumber);
        if (overlap)
        {
            throw new BAR.Domain.Exceptions.ConflictException("block.overlap", "Nummernbereich überschneidet sich mit bestehendem Block");
        }

        var newBlocks = new List<NumberBlock>(blockCount);
        var next = startNumber;
        for (var i = 0; i < blockCount; i++)
        {
            newBlocks.Add(NumberBlock.Assign(command.SellerId, next, settings.BlockSize, DateTime.UtcNow));
            next += settings.BlockSize;
        }

        await blocks.AddRangeAsync(newBlocks, cancellationToken);

        return newBlocks.Select(b => new BlockResponse(b.Id, b.SellerId, b.FromNumber, b.ToNumber, b.ToNumber - b.FromNumber + 1, 0, b.AssignedAt)).ToList();
    }
}
