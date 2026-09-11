using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Profile;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Profile.GetProfile;

public sealed class GetProfileQueryHandler(ISellerRepository sellers, IStammdatenModuleApi stammdaten)
{
    public async Task<ProfileDto> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");
        var conditions = await stammdaten.GetSellerTypeConditionsAsync(seller.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkaeufer-Typ nicht gefunden");

        return new ProfileDto(
            seller.Id, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
            seller.City, seller.Phone, seller.Email,
            new ProfileSellerTypeDto(conditions.SellerTypeId, conditions.Name, conditions.CommissionRate, conditions.ItemFee));
    }
}
