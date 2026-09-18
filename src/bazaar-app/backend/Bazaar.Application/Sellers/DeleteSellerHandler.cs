using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sellers;

public sealed class DeleteSellerHandler(ISellerRepository sellerRepository, IArticleCountBySellerQuery articleCountBySellerQuery)
{
    public async Task Handle(string id)
    {
        var seller = await sellerRepository.GetById(id)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        var articleCount = await articleCountBySellerQuery.CountBySellerId(id);
        if (articleCount > 0)
        {
            throw new ConflictException($"Verkäufer hat noch {articleCount} Artikel", "seller.has_articles");
        }

        await sellerRepository.Remove(seller);
    }
}
