using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.SellerTypes;

public sealed class UpdateSellerTypeHandler(ISellerTypeRepository sellerTypeRepository)
{
    public async Task Handle(UpdateSellerTypeCommand command)
    {
        var sellerType = await sellerTypeRepository.GetById(command.Id)
            ?? throw new NotFoundException("Verkäufer-Typ nicht gefunden", "seller_type.not_found");

        var trimmedName = command.Name.Trim();
        var oldName = sellerType.Name;

        if (!string.Equals(oldName, trimmedName, StringComparison.OrdinalIgnoreCase)
            && await sellerTypeRepository.ExistsByNameIgnoreCase(trimmedName))
        {
            throw new ConflictException("Verkäufer-Typ existiert bereits", "seller_type.name_taken");
        }

        sellerType.Update(trimmedName, command.CommissionRate, command.ItemFee);
        await sellerTypeRepository.Update(sellerType);
    }
}
