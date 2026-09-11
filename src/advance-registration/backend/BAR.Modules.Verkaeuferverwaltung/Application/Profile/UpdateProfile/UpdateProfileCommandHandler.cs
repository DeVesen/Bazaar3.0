using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Profile;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Profile.UpdateProfile;

public sealed class UpdateProfileCommandHandler(ISellerRepository sellers, IStammdatenModuleApi stammdaten)
{
    public async Task<ProfileDto> HandleAsync(string sellerId, UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

        // SellerType aendert sich durch dieses Update nicht - Lookup bewusst vor
        // dem Commit, damit ein 404 hier niemals einen bereits persistierten
        // Zustand hinterlaesst (sonst waere die Operation nicht atomar).
        var conditions = await stammdaten.GetSellerTypeConditionsAsync(seller.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkaeufer-Typ nicht gefunden");

        seller.UpdateProfile(command.FirstName, command.LastName, command.Address, command.PostalCode, command.City, command.Phone);
        await sellers.UpdateAsync(seller, cancellationToken);

        return new ProfileDto(
            seller.Id, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
            seller.City, seller.Phone, seller.Email,
            new ProfileSellerTypeDto(conditions.SellerTypeId, conditions.Name, conditions.CommissionRate, conditions.ItemFee));
    }
}
