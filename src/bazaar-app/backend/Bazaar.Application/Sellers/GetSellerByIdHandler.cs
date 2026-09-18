using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;

namespace Bazaar.Application.Sellers;

public sealed class GetSellerByIdHandler(ISellerRepository sellerRepository)
{
    public async Task<Seller> Handle(string id) =>
        await sellerRepository.GetById(id)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");
}
