using BAR.Modules.MasterData.Contracts;
using BAR.Modules.SellerManagement.Contracts.Profile;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Profile.GetProfile;

public sealed class GetProfileQueryHandler(ISellerRepository sellers, IMasterDataModuleApi masterData)
{
    public async Task<ProfileDto> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");
        var conditions = await masterData.GetSellerTypeConditionsAsync(seller.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkaeufer-Typ nicht gefunden");

        return new ProfileDto(
            seller.Id, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
            seller.City, seller.Phone, seller.Email,
            new ProfileSellerTypeDto(conditions.SellerTypeId, conditions.Name, conditions.CommissionRate, conditions.ItemFee));
    }
}
