using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sellers;

public sealed class GetSellerCardsHandler(ISellerCardsQuery sellerCardsQuery)
{
    public Task<SellerCardsPage> Handle(string? q, string? status, string? sort, int page, int pageSize) =>
        sellerCardsQuery.GetCards(q, status, sort, page, pageSize);
}
