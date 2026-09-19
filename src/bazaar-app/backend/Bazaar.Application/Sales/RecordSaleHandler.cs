using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sales;

/// <summary>
/// Books a batch of articles as sold atomically (api/sales.md). Every
/// articleId is re-checked inside the transaction — still Selling, and its
/// seller not yet settled — since the frontend's cart can be stale by the
/// time this request is booked; any violation aborts the whole Vorgang with
/// 409, no partial writes. Unlike ReleaseHandler there is no fee to
/// pre-check, so everything runs inside the transaction.
/// </summary>
public sealed class RecordSaleHandler(
    IArticleRepository articleRepository,
    ISellerRepository sellerRepository,
    IUnitOfWork unitOfWork)
{
    public async Task<RecordSaleResult> Handle(RecordSaleCommand command)
    {
        var soldCount = 0;
        var total = 0m;
        var soldAt = DateTimeOffset.UtcNow;

        await unitOfWork.ExecuteInTransactionAsync(async _ =>
        {
            var sellable = new List<Article>();
            var violations = new List<int>();
            var hasUnresolvedId = false;

            foreach (var articleId in command.ArticleIds)
            {
                var article = await articleRepository.GetById(articleId);
                if (article is null)
                {
                    hasUnresolvedId = true;
                    continue;
                }

                if (article.Status != ArticleStatus.Selling)
                {
                    violations.Add(article.Number);
                    continue;
                }

                var seller = await sellerRepository.GetById(article.SellerId)
                    ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

                if (seller.SettledAt is not null)
                {
                    violations.Add(article.Number);
                    continue;
                }

                sellable.Add(article);
            }

            if (violations.Count > 0)
            {
                throw new ConflictException(
                    $"Artikel {violations[0]} ist nicht mehr im Verkauf",
                    "article.not_sellable")
                {
                    Extensions =
                    {
                        ["articleNumbers"] = new List<int> { violations[0] },
                    },
                };
            }

            if (hasUnresolvedId)
            {
                // No article number to report — the id did not resolve to an article at all.
                throw new ConflictException("Artikel ist nicht mehr im Verkauf", "article.not_sellable");
            }

            var now = DateTimeOffset.UtcNow;

            foreach (var article in sellable)
            {
                article.RecordSale(now);
                await articleRepository.Update(article);
                total += article.Price;
            }

            soldCount = command.ArticleIds.Count;
            soldAt = now;
        }, CancellationToken.None);

        return new RecordSaleResult(soldCount, total, soldAt);
    }
}
