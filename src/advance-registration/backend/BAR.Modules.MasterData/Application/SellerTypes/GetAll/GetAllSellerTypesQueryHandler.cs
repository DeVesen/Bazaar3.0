using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.SellerManagement.Contracts;

namespace BAR.Modules.MasterData.Application.SellerTypes.GetAll;

public sealed class GetAllSellerTypesQueryHandler(ISellerTypeRepository sellerTypes, ISellerManagementModuleApi sellerManagement)
{
    public async Task<IReadOnlyList<SellerTypeDto>> HandleAsync(CancellationToken cancellationToken)
    {
        var all = await sellerTypes.GetAllAsync(cancellationToken);
        var result = new List<SellerTypeDto>(all.Count);

        foreach (var type in all)
        {
            var count = await sellerManagement.CountSellersByTypeAsync(type.Id, cancellationToken);
            result.Add(new SellerTypeDto(type.Id, type.Name, type.CommissionRate, type.ItemFee, count));
        }

        return result;
    }
}
