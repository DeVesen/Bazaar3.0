using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Sales;

/// <summary>
/// Reverts a checkout booking atomically (api/sales.md §2, "Storno des
/// letzten Vorgangs"). Unlike RecordSaleHandler, the lock check here is
/// flat — a settled seller blocks the whole undo immediately, no
/// number-collecting across the batch.
/// </summary>
public sealed class UndoSaleHandler(
    IArticleRepository articleRepository,
    ISellerRepository sellerRepository,
    IUnitOfWork unitOfWork)
{
    public Task Handle(UndoSaleCommand command) =>
        unitOfWork.ExecuteInTransactionAsync(async _ =>
        {
            var now = DateTimeOffset.UtcNow;

            foreach (var articleId in command.ArticleIds)
            {
                var article = await articleRepository.GetById(articleId)
                    ?? throw new NotFoundException("Artikel nicht gefunden", "article.not_found");

                var seller = await sellerRepository.GetById(article.SellerId)
                    ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

                if (seller.SettledAt.HasValue)
                {
                    throw new ConflictException(
                        "Verkäufer ist bereits abgerechnet — Storno nicht mehr möglich",
                        "settlement.locked");
                }

                article.UndoSale(now);
                await articleRepository.Update(article);
            }
        }, CancellationToken.None);
}
