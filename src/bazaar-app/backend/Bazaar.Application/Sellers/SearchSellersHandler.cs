using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sellers;

public sealed class SearchSellersHandler(ISellerSearchQuery sellerSearchQuery)
{
    public Task<IReadOnlyList<SellerSearchResult>> Handle(string? q) =>
        sellerSearchQuery.Search(q);
}
