using BAR.Domain.Ports;

namespace BAR.Application.Blocks.GetMine;

public sealed class GetMyBlocksQueryHandler(INumberBlockRepository blocks)
{
    public async Task<IReadOnlyList<BlockResult>> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var result = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        return result
            .OrderBy(b => b.FromNumber)
            .Select(b => new BlockResult(b.Id, b.SellerId, b.FromNumber, b.ToNumber, b.AssignedAt))
            .ToList();
    }
}
