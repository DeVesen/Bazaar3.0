using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Sellers.Update;

public sealed class UpdateSellerCommandHandler(ISellerRepository sellers, ISellerTypeRepository sellerTypes)
{
    public async Task<SellerResponse> HandleAsync(UpdateSellerCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByIdAsync(command.SellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Unbekannte Verkäufer-ID");

        var existingWithEmail = await sellers.GetByEmailAsync(command.Email, cancellationToken);
        if (existingWithEmail is not null && existingWithEmail.Id != seller.Id)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var sellerType = await sellerTypes.GetByIdAsync(command.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Unbekannter Verkäufer-Typ");

        seller.UpdateAsAdmin(
            command.FirstName, command.LastName, command.Address, command.PostalCode,
            command.City, command.Phone, command.Email, command.SellerTypeId, command.IsAdmin);

        await sellers.UpdateAsync(seller, cancellationToken);

        return new SellerResponse(
            seller.Id, null, seller.FirstName, seller.LastName, seller.Address, seller.PostalCode,
            seller.City, seller.Phone, seller.Email, seller.SellerTypeId,
            new SellerTypeSummary(sellerType.Id, sellerType.Name, sellerType.CommissionRate, sellerType.ItemFee),
            seller.IsAdmin, 0, seller.InviteToken != null);
    }
}
