using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Release;

/// <summary>
/// Releases a batch of a seller's pre-registered articles atomically
/// (api/release.md). Every articleId is re-checked inside the transaction —
/// belongs to sellerId, ReleasedAt still null — since the frontend's
/// scan-time check can be stale by the time this request is booked; any
/// violation aborts the whole Vorgang with 409, no partial writes. The fee
/// is validated before the transaction (fail fast), everything else —
/// re-check, writes, fee booking — runs inside one IUnitOfWork transaction.
/// </summary>
public sealed class ReleaseHandler(
    IArticleRepository articleRepository,
    ISellerRepository sellerRepository,
    IUnitOfWork unitOfWork)
{
    public async Task<ReleaseResult> Handle(ReleaseCommand command)
    {
        var seller = await sellerRepository.GetById(command.SellerId)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        // Fee check before the transaction/loop (fail fast, api/release.md: "400 bei Abweichung").
        var expectedFee = command.ArticleIds.Count * seller.FeePerItem;
        if (expectedFee != command.FeeAmount)
        {
            throw new BadRequestException(
                "Gebührenbetrag stimmt nicht mit Anzahl Artikel × Gebühr je Artikel überein",
                "release.fee_mismatch");
        }

        var releasedCount = 0;
        var intakeFeePaid = 0m;

        await unitOfWork.ExecuteInTransactionAsync(async _ =>
        {
            var releasable = new List<Article>();
            var notReleasable = new List<int>();
            var hasUnresolvedId = false;

            foreach (var articleId in command.ArticleIds)
            {
                var article = await articleRepository.GetById(articleId);
                if (article is null)
                {
                    hasUnresolvedId = true;
                    continue;
                }

                if (article.SellerId == command.SellerId && article.ReleasedAt is null)
                {
                    releasable.Add(article);
                    continue;
                }

                notReleasable.Add(article.Number);
            }

            if (notReleasable.Count > 0 || hasUnresolvedId)
            {
                throw new ConflictException(
                    $"Artikel{(notReleasable.Count > 1 ? "" : "")} {string.Join(", ", notReleasable)} ist nicht freigebbar",
                    "article.not_releasable")
                {
                    Extensions =
                    {
                        ["articleNumbers"] = notReleasable,
                    },
                };
            }

            var now = DateTimeOffset.UtcNow;

            foreach (var article in releasable)
            {
                article.MarkReleased(now);
                await articleRepository.Update(article);
            }

            releasedCount = releasable.Count;

            // Re-fetch inside the closure — a CreateExecutionStrategy retry (Program.cs:
            // EnableRetryOnFailure) re-runs this whole delegate on a transient failure
            // that happens after a mutation but before commit. Mutating the outer
            // `seller` captured before the transaction would double-apply
            // AddIntakeFeePaid on the same in-memory instance across attempts; fetching
            // fresh here means each attempt mutates its own instance (mirrors
            // IntakeHandler's identical retry-safety pattern).
            var freshSeller = await sellerRepository.GetById(command.SellerId)
                ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

            freshSeller.AddIntakeFeePaid(command.FeeAmount);
            await sellerRepository.Update(freshSeller);
            intakeFeePaid = freshSeller.IntakeFeePaid;
        }, CancellationToken.None);

        return new ReleaseResult(releasedCount, intakeFeePaid);
    }
}
