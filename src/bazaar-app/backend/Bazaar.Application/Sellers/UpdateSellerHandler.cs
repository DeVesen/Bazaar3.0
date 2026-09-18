using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sellers;

public sealed class UpdateSellerHandler(ISellerRepository sellerRepository)
{
    public async Task Handle(UpdateSellerCommand command)
    {
        var seller = await sellerRepository.GetById(command.Id)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        if (seller.SettledAt is not null)
        {
            throw new ConflictException("Verkäufer ist bereits abgerechnet", "settlement.locked");
        }

        var conditionsChanged = command.SalesCommission != seller.SalesCommission
            || command.FeePerItem != seller.FeePerItem;
        if (conditionsChanged && !command.CallerIsAdmin)
        {
            throw new ForbiddenException(
                "Konditionen dürfen nur von Administratoren geändert werden",
                "seller.conditions_admin_only");
        }

        seller.UpdateDetails(
            command.FirstName,
            command.LastName,
            command.Address,
            command.PostalCode,
            command.City,
            command.Phone,
            command.Email,
            command.SellerTypeId);

        if (command.CallerIsAdmin)
        {
            seller.UpdateConditions(command.SalesCommission, command.FeePerItem);
        }

        await sellerRepository.Update(seller);
    }
}
