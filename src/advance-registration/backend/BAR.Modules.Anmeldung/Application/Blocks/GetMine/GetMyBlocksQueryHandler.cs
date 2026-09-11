using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Modules.Anmeldung.Domain.Ports;

namespace BAR.Modules.Anmeldung.Application.Blocks.GetMine;

public sealed class GetMyBlocksQueryHandler(INumberBlockRepository blocks, IArticleRepository articles)
{
    public async Task<IReadOnlyList<BlockDto>> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var result = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        var ordered = result.OrderBy(b => b.FromNumber).ToList();

        var items = new List<BlockDto>(ordered.Count);
        foreach (var b in ordered)
        {
            var usedCount = await articles.CountInRangeForSellerAsync(b.SellerId, b.FromNumber, b.ToNumber, cancellationToken);
            items.Add(new BlockDto(b.Id, b.SellerId, b.FromNumber, b.ToNumber, b.ToNumber - b.FromNumber + 1, usedCount, b.AssignedAt));
        }

        return items;
    }
}
