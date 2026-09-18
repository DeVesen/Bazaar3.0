using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Articles;

public sealed class DeleteArticleHandler(IArticleRepository articleRepository, ISellerRepository sellerRepository)
{
    public async Task Handle(string id)
    {
        var article = await articleRepository.GetById(id)
            ?? throw new NotFoundException("Artikel nicht gefunden", "article.not_found");

        if (article.SoldAt != null)
        {
            throw new ConflictException("Artikel ist verkauft", "article.sold");
        }

        var seller = await sellerRepository.GetById(article.SellerId);
        if (seller?.SettledAt != null)
        {
            throw new ConflictException("Verkäufer ist abgerechnet", "settlement.locked");
        }

        await articleRepository.Remove(article);
    }
}
