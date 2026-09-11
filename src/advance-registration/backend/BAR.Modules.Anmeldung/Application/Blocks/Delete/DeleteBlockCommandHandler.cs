using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Anmeldung.Application.Blocks.Delete;

public sealed class DeleteBlockCommandHandler(INumberBlockRepository blocks, IArticleRepository articles)
{
    public async Task HandleAsync(DeleteBlockCommand command, CancellationToken cancellationToken)
    {
        var block = await blocks.GetByIdAsync(command.BlockId, cancellationToken);
        if (block is null || block.SellerId != command.SellerId)
        {
            throw new NotFoundException("block.not_found", "Block unbekannt oder gehört nicht zu diesem Verkäufer");
        }

        var usedCount = await articles.CountInRangeForSellerAsync(block.SellerId, block.FromNumber, block.ToNumber, cancellationToken);
        if (usedCount > 0)
        {
            throw new ConflictException("block.in_use", "Block enthält bereits vergebene Nummern");
        }

        await blocks.DeleteAsync(block, cancellationToken);
    }
}
