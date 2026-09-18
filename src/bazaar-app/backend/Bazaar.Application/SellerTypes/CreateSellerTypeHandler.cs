using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.SellerTypes;

namespace Bazaar.Application.SellerTypes;

public sealed class CreateSellerTypeHandler(ISellerTypeRepository sellerTypeRepository, IIdGenerator idGenerator)
{
    public async Task<SellerType> Handle(CreateSellerTypeCommand command)
    {
        var trimmedName = command.Name.Trim();
        if (await sellerTypeRepository.ExistsByNameIgnoreCase(trimmedName))
        {
            throw new ConflictException("Verkäufer-Typ existiert bereits", "seller_type.name_taken");
        }

        var sellerType = SellerType.Create(idGenerator.Generate(), trimmedName, command.CommissionRate, command.ItemFee);
        await sellerTypeRepository.Add(sellerType);
        return sellerType;
    }
}
