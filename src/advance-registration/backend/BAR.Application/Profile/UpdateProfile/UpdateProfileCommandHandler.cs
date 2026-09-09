using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Profile.UpdateProfile;

public sealed class UpdateProfileCommandHandler(ISellerRepository sellers, ISellerTypeRepository sellerTypes)
{
    public async Task<ProfileResult> HandleAsync(string sellerId, UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

        seller.UpdateProfile(command.FirstName, command.LastName, command.Address, command.PostalCode, command.City, command.Phone);
        await sellers.UpdateAsync(seller, cancellationToken);

        var sellerType = await sellerTypes.GetByIdAsync(seller.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkaeufer-Typ nicht gefunden");

        return ProfileResult.From(seller, sellerType);
    }
}
