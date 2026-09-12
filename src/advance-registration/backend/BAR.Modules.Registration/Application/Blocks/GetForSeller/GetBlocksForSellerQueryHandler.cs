using BAR.Modules.Registration.Contracts.Blocks;
using BAR.Modules.Registration.Domain.Ports;

namespace BAR.Modules.Registration.Application.Blocks.GetForSeller;

/// <summary>
/// The admin view of a given seller's blocks (GET /api/sellers/{id}/blocks) -
/// previously wired directly against the repository ports in the Host
/// endpoint; now sits behind the Contracts facade like every other use case.
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
