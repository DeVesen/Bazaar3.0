using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Settlement;

public sealed class ReturnArticleHandler(IArticleRepository articleRepository, ISellerRepository sellerRepository)
{
    public async Task Handle(string articleId, DateTimeOffset now)
    {
        var article = await articleRepository.GetById(articleId)
            ?? throw new NotFoundException("Artikel nicht gefunden", "article.not_found");

        var seller = await sellerRepository.GetById(article.SellerId)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        if (seller.SettledAt is not null)
        {
            throw new ConflictException("Verkäufer ist bereits abgerechnet", "settlement.locked");
        }

        article.Return(now);
        await articleRepository.Update(article);
    }
}
