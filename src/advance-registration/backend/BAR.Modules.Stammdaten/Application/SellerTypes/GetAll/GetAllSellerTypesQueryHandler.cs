using BAR.Modules.Stammdaten.Contracts.SellerTypes;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Contracts;

namespace BAR.Modules.Stammdaten.Application.SellerTypes.GetAll;

public sealed class GetAllSellerTypesQueryHandler(ISellerTypeRepository sellerTypes, IVerkaeuferverwaltungModuleApi verkaeuferverwaltung)
{
    public async Task<IReadOnlyList<SellerTypeDto>> HandleAsync(CancellationToken cancellationToken)
    {
        var all = await sellerTypes.GetAllAsync(cancellationToken);
        var result = new List<SellerTypeDto>(all.Count);

        foreach (var type in all)
        {
            var count = await verkaeuferverwaltung.CountSellersByTypeAsync(type.Id, cancellationToken);
            result.Add(new SellerTypeDto(type.Id, type.Name, type.CommissionRate, type.ItemFee, count));
        }

        return result;
    }
}
