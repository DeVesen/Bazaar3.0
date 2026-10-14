using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sellers;

public sealed class DeleteSellerHandler(ISellerRepository sellerRepository, IArticleRepository articleRepository)
{
    public async Task Handle(string id)
    {
        var seller = await sellerRepository.GetById(id)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        foreach (var article in await articleRepository.GetAllBySellerId(id))
        {
            await articleRepository.Remove(article);
        }

        await sellerRepository.Remove(seller);
    }
}
