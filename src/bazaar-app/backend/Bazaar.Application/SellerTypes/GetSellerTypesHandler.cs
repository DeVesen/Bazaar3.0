using Bazaar.Domain.Ports;

namespace Bazaar.Application.SellerTypes;

public sealed record SellerTypeListItem(string Id, string Name, decimal CommissionRate, decimal ItemFee, int SellerCount);

public sealed class GetSellerTypesHandler(ISellerTypeRepository sellerTypeRepository, ISellerCountBySellerTypeQuery sellerCountBySellerTypeQuery)
{
    public async Task<IReadOnlyList<SellerTypeListItem>> Handle()
    {
        var sellerTypes = await sellerTypeRepository.GetAll();
        var items = new List<SellerTypeListItem>();
        foreach (var sellerType in sellerTypes.OrderBy(s => s.Name, StringComparer.OrdinalIgnoreCase))
        {
            var count = await sellerCountBySellerTypeQuery.CountBySellerTypeId(sellerType.Id);
            items.Add(new SellerTypeListItem(sellerType.Id, sellerType.Name, sellerType.CommissionRate, sellerType.ItemFee, count));
        }
        return items;
    }
}
