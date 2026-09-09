using BAR.Domain.Ports;

namespace BAR.Application.SellerTypes.GetAll;

public sealed class GetAllSellerTypesQueryHandler(ISellerTypeRepository sellerTypes)
{
    public async Task<IReadOnlyList<SellerTypeResult>> HandleAsync(CancellationToken cancellationToken)
    {
        var all = await sellerTypes.GetAllAsync(cancellationToken);
        var result = new List<SellerTypeResult>(all.Count);

        foreach (var type in all)
        {
            var count = await sellerTypes.CountSellersAsync(type.Id, cancellationToken);
            result.Add(new SellerTypeResult(type.Id, type.Name, type.CommissionRate, type.ItemFee, count));
        }

        return result;
    }
}
