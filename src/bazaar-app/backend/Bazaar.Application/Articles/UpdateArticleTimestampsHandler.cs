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
        var previousSoldAt = article.SoldAt;
        // SoldManually only changes on the two transitions that actually mean something for
        // the audit bit: newly set (null -> non-null) turns it on, reset (non-null -> null)
        // turns it off. A pure value correction (non-null -> a DIFFERENT non-null value, e.g.
        // fixing a fat-fingered time) leaves the flag exactly as it was — it doesn't undo the
        // sale, so there is nothing to "un-flag", and it wasn't a fresh manual sale either.
        bool manually;
        if (previousSoldAt == command.SoldAt)
        {
            manually = article.SoldManually;
        }
        else if (previousSoldAt is null)
        {
            manually = command.SoldAt is not null;
        }
        else if (command.SoldAt is null)
        {
            manually = false;
        }
        else
        {
            manually = article.SoldManually;
        }

        article.SetTimestamps(command.ReleasedAt, command.SoldAt, command.ReturnedAt, manually, now);

        await articleRepository.Update(article);
    }
}
