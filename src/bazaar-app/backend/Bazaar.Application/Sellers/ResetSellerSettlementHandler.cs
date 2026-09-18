using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sellers;

public sealed class ResetSellerSettlementHandler(ISellerRepository sellerRepository)
{
    public async Task Handle(string id)
    {
        var seller = await sellerRepository.GetById(id)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        if (seller.SettledAt is null)
        {
            throw new NotFoundException("Verkäufer ist nicht abgerechnet", "settlement.not_settled");
        }

        seller.ResetSettlement();
        await sellerRepository.Update(seller);
    }
}
