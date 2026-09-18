using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.SellerTypes;

public sealed class DeleteSellerTypeHandler(ISellerTypeRepository sellerTypeRepository, ISellerCountBySellerTypeQuery sellerCountBySellerTypeQuery)
{
    public async Task Handle(string id)
    {
        var sellerType = await sellerTypeRepository.GetById(id)
            ?? throw new NotFoundException("Verkäufer-Typ nicht gefunden", "seller_type.not_found");

        var sellerCount = await sellerCountBySellerTypeQuery.CountBySellerTypeId(id);
        if (sellerCount > 0)
        {
            throw new ConflictException("Verkäufer-Typ wird noch verwendet", "seller_type.in_use");
        }

        await sellerTypeRepository.Remove(sellerType);
    }
}
