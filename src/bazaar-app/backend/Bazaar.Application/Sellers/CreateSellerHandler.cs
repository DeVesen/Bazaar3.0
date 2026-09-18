using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;

namespace Bazaar.Application.Sellers;

public sealed class CreateSellerHandler(
    ISellerRepository sellerRepository,
    ISellerTypeRepository sellerTypeRepository,
    IIdGenerator idGenerator)
{
    public async Task<Seller> Handle(CreateSellerCommand command)
    {
        var sellerType = await sellerTypeRepository.GetById(command.SellerTypeId)
            ?? throw new NotFoundException("Verkäufer-Typ nicht gefunden", "seller_type.not_found");

        var seller = Seller.Create(
            idGenerator.Generate(),
            command.FirstName,
            command.LastName,
            command.Address,
            command.PostalCode,
            command.City,
            command.Phone,
            command.Email,
            command.SellerTypeId,
            sellerType.CommissionRate,
            sellerType.ItemFee);

        await sellerRepository.Add(seller);
        return seller;
    }
}
