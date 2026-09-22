using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Intake;

/// <summary>
/// Books an entire intake request atomically (api/intake.md). For every
/// line, a free number creates a new article; a number pre-registered to
/// the same seller and not yet released is updated in place ("nachgebucht");
/// any other collision aborts the whole request with 409, since two intake
/// desks can race for the same free number the frontend saw a moment ago.
/// A line with <see cref="IntakeArticleLine.DeleteArticleNumber"/> set (Artikelannahme
/// renumber flow) first deletes that old pre-registered article — always, even if it equals
/// the line's own target number — before the usual create/update/conflict logic runs; a
/// stale/mismatched delete target is skipped silently rather than aborting the booking.
/// The fee is validated before the transaction (fail fast), everything else
/// — number resolution, writes, fee booking — runs inside one
/// IUnitOfWork transaction so a mid-loop failure never leaves a partially
/// booked box.
/// </summary>
public sealed class IntakeHandler(
    IArticleRepository articleRepository,
    ISellerRepository sellerRepository,
    IIdGenerator idGenerator,
    IUnitOfWork unitOfWork)
{
    public async Task<IntakeResult> Handle(IntakeCommand command)
    {
        var seller = await sellerRepository.GetById(command.SellerId)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        // Fee check before the transaction/loop (fail fast, api/intake.md: "400 bei Abweichung").
        var expectedFee = command.Articles.Count * seller.FeePerItem;
        if (expectedFee != command.FeeAmount)
        {
            throw new BadRequestException(
                "Gebührenbetrag stimmt nicht mit Anzahl Artikel × Gebühr je Artikel überein",
                "intake.fee_mismatch");
        }

        var articleIds = new List<string>();
        var intakeFeePaid = 0m;

        await unitOfWork.ExecuteInTransactionAsync(async _ =>
        {
            articleIds.Clear();

            foreach (var line in command.Articles)
            {
                if (line.DeleteArticleNumber is not { } deleteNumber) continue;

                var oldArticle = await articleRepository.GetByNumber(deleteNumber);
                if (oldArticle is null || oldArticle.SellerId != command.SellerId || oldArticle.ReleasedAt is not null)
                {
                    // Race zwischen "Übernehmen" und dem finalen Buchen (Zustand hat sich geändert oder
                    // Artikel existiert nicht mehr) — Löschen wird bewusst still übersprungen, siehe
                    // Spec "Backend" Abschnitt. Der Ziel-Artikel wird trotzdem normal angelegt.
                    continue;
                }

                await articleRepository.Remove(oldArticle);
            }

            var toCreate = new List<IntakeArticleLine>();
            var toUpdate = new List<(Article Existing, IntakeArticleLine Line)>();
            var taken = new List<int>();

            foreach (var line in command.Articles)
            {
                var existing = await articleRepository.GetByNumber(line.Number);
                if (existing is null)
                {
                    toCreate.Add(line);
                    continue;
                }

                if (existing.SellerId == command.SellerId && existing.ReleasedAt is null)
                {
                    toUpdate.Add((existing, line));
                    continue;
                }

                taken.Add(line.Number);
            }

            if (taken.Count > 0)
            {
                throw new ConflictException(
                    $"Artikelnummer{(taken.Count > 1 ? "n" : "")} {string.Join(", ", taken)} ist inzwischen vergeben",
                    "article.number_taken")
                {
                    Extensions =
                    {
                        ["takenNumbers"] = taken,
                        ["nextNumber"] = (await articleRepository.GetMaxNumber() ?? 0) + 1,
                    },
                };
            }

            var now = DateTimeOffset.UtcNow;

            foreach (var line in toCreate)
            {
                var id = idGenerator.Generate();
                var article = Article.Create(
                    id, line.Number, command.SellerId, line.Name, line.Brand, line.Category,
                    line.Price, line.Size, line.Color, line.Description, now, now);
                article.MarkAcceptedAndReleased(now);

                await articleRepository.Add(article);
                articleIds.Add(id);
            }

            foreach (var (existing, line) in toUpdate)
            {
                existing.UpdateDetails(line.Name, line.Brand, line.Category, line.Price, line.Size, line.Color, line.Description, now);
                existing.MarkAcceptedAndReleased(now);

                await articleRepository.Update(existing);
                articleIds.Add(existing.Id);
            }

            // Re-fetch inside the closure — a CreateExecutionStrategy retry (Program.cs:
            // EnableRetryOnFailure) re-runs this whole delegate on a transient failure
            // that happens after a mutation but before commit. Mutating the outer
            // `seller` captured before the transaction would double-apply
            // AddIntakeFeePaid on the same in-memory instance across attempts; fetching
            // fresh here means each attempt mutates its own instance (mirrors
            // ChangePasswordHandler's fetch-inside-scope pattern, applied to the one
            // spot in this handler that mutates state persisted across the retry
            // boundary).
            var freshSeller = await sellerRepository.GetById(command.SellerId)
                ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

            freshSeller.AddIntakeFeePaid(command.FeeAmount);
            await sellerRepository.Update(freshSeller);
            intakeFeePaid = freshSeller.IntakeFeePaid;
        }, CancellationToken.None);

        return new IntakeResult(articleIds, intakeFeePaid);
    }
}
