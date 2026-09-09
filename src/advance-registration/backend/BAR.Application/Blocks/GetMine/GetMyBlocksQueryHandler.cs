using BAR.Domain.Ports;

namespace BAR.Application.Blocks.GetMine;

public sealed class GetMyBlocksQueryHandler(INumberBlockRepository blocks)
{
    public async Task<IReadOnlyList<BlockResult>> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var result = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        return result
            .OrderBy(b => b.FromNumber)
            .Select(b => new BlockResult(
                b.Id, b.SellerId, b.FromNumber, b.ToNumber,
                NumberCount: b.ToNumber - b.FromNumber + 1,
                // UsedCount ist in R02 immer 0 - es gibt noch kein Artikel-Entity,
                // gegen das gezaehlt werden koennte (Epic_Meine_Artikel folgt spaeter).
                UsedCount: 0,
                b.AssignedAt))
            .ToList();
    }
}
