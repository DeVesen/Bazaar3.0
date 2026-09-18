using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sellers;

public sealed class GetSellerArticlesHandler(ISellerRepository sellerRepository, IArticlesBySellerQuery articlesBySellerQuery)

{
    public async Task<IReadOnlyList<SellerArticleSummary>> Handle(string id)
    {
        _ = await sellerRepository.GetById(id)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        return await articlesBySellerQuery.GetBySellerId(id);
    }
}
