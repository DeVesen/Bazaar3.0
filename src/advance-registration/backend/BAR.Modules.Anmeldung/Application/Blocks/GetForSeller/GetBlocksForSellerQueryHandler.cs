using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Modules.Anmeldung.Domain.Ports;

namespace BAR.Modules.Anmeldung.Application.Blocks.GetForSeller;

/// <summary>
/// Admin-Ansicht der Bloecke eines bestimmten Verkaeufers
/// (GET /api/sellers/{id}/blocks) - frueher direkt im Host-Endpoint gegen die
/// Repository-Ports verdrahtet; liegt jetzt hinter der Contracts-Facade wie
/// jeder andere Anwendungsfall auch.
/// </summary>
public sealed class GetBlocksForSellerQueryHandler(INumberBlockRepository blocks, IArticleRepository articles)
{
    public async Task<IReadOnlyList<BlockDto>> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        var result = new List<BlockDto>();
        foreach (var block in sellerBlocks)
        {
            var usedCount = await articles.CountInRangeForSellerAsync(block.SellerId, block.FromNumber, block.ToNumber, cancellationToken);
            result.Add(new BlockDto(block.Id, block.SellerId, block.FromNumber, block.ToNumber, block.ToNumber - block.FromNumber + 1, usedCount, block.AssignedAt));
        }

        return result;
    }
}
