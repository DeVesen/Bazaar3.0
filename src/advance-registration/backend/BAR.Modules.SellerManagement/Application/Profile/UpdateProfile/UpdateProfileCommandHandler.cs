using BAR.Modules.MasterData.Contracts;
using BAR.Modules.SellerManagement.Contracts.Profile;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Profile.UpdateProfile;

public sealed class UpdateProfileCommandHandler(ISellerRepository sellers, IMasterDataModuleApi masterData)
{
    public async Task<ProfileDto> HandleAsync(string sellerId, UpdateProfileCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

        // SellerType does not change through this update - the lookup is
        // deliberately placed before the commit, so a 404 here can never
        // leave behind an already-persisted state (otherwise the operation
        // would not be atomic).
        var conditions = await masterData.GetSellerTypeConditionsAsync(seller.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkaeufer-Typ nicht gefunden");

        seller.UpdateProfile(command.FirstName, command.LastName, command.Address, command.PostalCode, command.City, command.Phone);
        await sellers.UpdateAsync(seller, cancellationToken);

        return new ProfileDto(
            seller.Id, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
            seller.City, seller.Phone, seller.Email,
            new ProfileSellerTypeDto(conditions.SellerTypeId, conditions.Name, conditions.CommissionRate, conditions.ItemFee));
    }
}
