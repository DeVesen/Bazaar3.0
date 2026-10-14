using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Settlement;

namespace Bazaar.Application.Settlement;

/// <summary>
/// Books a seller's settlement (POST /api/sellers/{id}/settlement,
/// api/settlement.md §3) — one transaction over ISellerRepository and
/// IArticleRepository. Mirrors ReleaseHandler's transaction pattern: fetch
/// the seller before the transaction only to fail fast on 404, then do all
/// real reads/writes/re-checks inside unitOfWork.ExecuteInTransactionAsync,
/// re-fetching the seller inside the closure before mutating it — a
/// CreateExecutionStrategy retry re-runs the whole delegate, so mutating an
/// outer-captured instance would double-apply Settle across attempts.
/// </summary>
public sealed class SettleSellerHandler(
    IArticleRepository articleRepository,
    ISellerRepository sellerRepository,
    IUnitOfWork unitOfWork)
{
    public async Task<SettleSellerResult> Handle(SettleSellerCommand command)
    {
        _ = await sellerRepository.GetById(command.SellerId)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        var settledAt = default(DateTimeOffset);
        var payoutAmount = 0m;
        var removedArticleCount = 0;

        await unitOfWork.ExecuteInTransactionAsync(async _ =>
        {
            // Re-fetch inside the closure — see class remarks; mirrors
            // ReleaseHandler's identical retry-safety pattern.
            var seller = await sellerRepository.GetById(command.SellerId)
                ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

            var articles = await articleRepository.GetAllBySellerId(command.SellerId);

            // spec.md §Backend orders these two checks: open-articles first,
            // already-settled second (plan.md numbers them the other way
            // round — spec.md is the binding authority for this round).
            var openCount = articles.Count(a => a.ReleasedAt != null && a.SoldAt == null && a.ReturnedAt == null);
            if (openCount > 0)
            {
                throw new ConflictException($"{openCount} Artikel sind noch im Verkauf", "settlement.articles_open")
                {
                    Extensions = { ["openCount"] = openCount },
                };
            }

            if (seller.SettledAt.HasValue)
            {
                throw new ConflictException("Verkäufer ist bereits abgerechnet", "settlement.already_settled");
            }

            // Mirrors GetSellerSettlementHandler's canSettle = releasedCount > 0 && openCount == 0
            // (Round-20). A seller with zero released articles (nothing ever handed over) must
            // not be settleable either — without this check, openCount stays 0, revenue/payout
            // are both 0, and a {"payoutAmount": 0} request would pass through and irrecoverably
            // hard-delete every ReleasedAt == null article of this seller below. No dedicated
            // errorCode is defined for this case in settlement.md/spec.md — both this and the
            // open-articles case mean "not settleable yet", so the same articles_open code is
            // reused here. Checked after already-settled so a settled seller always gets
            // already_settled regardless of article state.
            var releasedCount = articles.Count(a => a.ReleasedAt != null);
            if (releasedCount == 0)
            {
                throw new ConflictException("Verkäufer hat keine freigegebenen Artikel", "settlement.articles_open");
            }

            var revenue = articles.Where(a => a.SoldAt != null).Sum(a => a.Price);
            var (_, payout) = SettlementCalculation.Calculate(revenue, seller.SalesCommission);

            if (command.PayoutAmount != payout)
            {
                throw new BadRequestException("Betrag weicht von der Berechnung ab", "settlement.payout_mismatch")
                {
                    Extensions =
                    {
                        ["errors"] = new Dictionary<string, string[]>
                        {
                            ["payoutAmount"] = ["Betrag weicht von der Berechnung ab"],
                        },
                    },
                };
            }

            var now = DateTimeOffset.UtcNow;
            seller.Settle(command.PayoutAmount, now);
            await sellerRepository.Update(seller);

            var notDelivered = command.RemoveNotDelivered
                ? articles.Where(a => a.ReleasedAt == null).ToList()
                : [];
            foreach (var article in notDelivered)
            {
                await articleRepository.Remove(article);
            }

            settledAt = now;
            payoutAmount = command.PayoutAmount;
            removedArticleCount = notDelivered.Count;
        }, CancellationToken.None);

        return new SettleSellerResult(settledAt, payoutAmount, removedArticleCount);
    }
}

public sealed record SettleSellerResult(DateTimeOffset SettledAt, decimal PayoutAmount, int RemovedArticleCount);
