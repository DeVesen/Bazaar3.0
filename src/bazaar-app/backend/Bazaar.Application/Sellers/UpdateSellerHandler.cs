using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sellers;

/// <summary>
/// Handles PUT /api/sellers/{id}. Two independent rules govern
/// SalesCommission/FeePerItem, per api/sellers.md §4:
///
/// 1. Type change (`command.SellerTypeId != seller.SellerTypeId`): "Typwechsel
///    überschreibt die Konditionen mit den Werten des neuen Typs, auch manuell
///    gesetzte" — no role restriction. The new type's own SalesCommission/
///    FeePerItem are looked up via <see cref="ISellerTypeRepository"/> (same
///    pattern as CreateSellerHandler) and applied, always winning over
///    whatever SalesCommission/FeePerItem happened to be sent in the same
///    request — even for an admin.
/// 2. Type unchanged: an admin may directly override SalesCommission/
///    FeePerItem with the request's values; a non-admin sending changed
///    values gets `403 seller.conditions_admin_only` (unchanged pass-through
///    values are a no-op, not an error).
/// </summary>
public sealed class UpdateSellerHandler(ISellerRepository sellerRepository, ISellerTypeRepository sellerTypeRepository)
{
    public async Task Handle(UpdateSellerCommand command)
    {
        var seller = await sellerRepository.GetById(command.Id)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        if (seller.SettledAt is not null)
        {
            throw new ConflictException("Verkäufer ist bereits abgerechnet", "settlement.locked");
        }

        var typeChanged = command.SellerTypeId != seller.SellerTypeId;

        if (!typeChanged)
        {
            var conditionsChanged = command.SalesCommission != seller.SalesCommission
                || command.FeePerItem != seller.FeePerItem;
            if (conditionsChanged && !command.CallerIsAdmin)
            {
                throw new ForbiddenException(
                    "Konditionen dürfen nur von Administratoren geändert werden",
                    "seller.conditions_admin_only");
            }
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

        if (typeChanged)
        {
            // Type change always wins over any manually sent conditions in the
            // same request, regardless of caller role — see class summary.
            var newType = await sellerTypeRepository.GetById(command.SellerTypeId)
                ?? throw new NotFoundException("Verkäufer-Typ nicht gefunden", "seller_type.not_found");
            seller.UpdateConditions(newType.CommissionRate, newType.ItemFee);
        }
        else if (command.CallerIsAdmin)
        {
            seller.UpdateConditions(command.SalesCommission, command.FeePerItem);
        }

        await sellerRepository.Update(seller);
    }
}
