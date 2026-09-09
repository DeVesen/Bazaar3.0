using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Profile.UpdateProfile;

public sealed class UpdateProfileCommandHandler(ISellerRepository sellers, ISellerTypeRepository sellerTypes)
{
    public async Task<ProfileResult> HandleAsync(string sellerId, UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

        // SellerType aendert sich durch dieses Update nicht - Lookup bewusst vor
        // dem Commit, damit ein 404 hier niemals einen bereits persistierten
        // Zustand hinterlaesst (sonst waere die Operation nicht atomar).
        var sellerType = await sellerTypes.GetByIdAsync(seller.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkaeufer-Typ nicht gefunden");

        seller.UpdateProfile(command.FirstName, command.LastName, command.Address, command.PostalCode, command.City, command.Phone);
        await sellers.UpdateAsync(seller, cancellationToken);

        return ProfileResult.From(seller, sellerType);
    }
}
