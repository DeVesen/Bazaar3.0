using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Articles;

public sealed class UpdateArticleTimestampsHandler(IArticleRepository articleRepository, ISellerRepository sellerRepository)
{
    public async Task Handle(UpdateArticleTimestampsCommand command)
    {
        var article = await articleRepository.GetById(command.Id)
            ?? throw new NotFoundException("Artikel nicht gefunden", "article.not_found");

        var seller = await sellerRepository.GetById(article.SellerId);
        if (seller?.SettledAt != null)
        {
            throw new ConflictException("Verkäufer ist abgerechnet", "settlement.locked");
        }

        var now = DateTimeOffset.UtcNow;
        var wasSold = article.SoldAt != null;
        var manually = !wasSold && command.SoldAt != null;

        article.SetTimestamps(command.ReleasedAt, command.SoldAt, command.ReturnedAt, manually, now);

        await articleRepository.Update(article);
    }
}
