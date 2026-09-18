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

        await unitOfWork.ExecuteInTransactionAsync(async _ =>
        {
            articleIds.Clear();

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
                throw new ConflictException("Artikelnummer(n) vergeben", "article.number_taken")
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

            seller.AddIntakeFeePaid(command.FeeAmount);
            await sellerRepository.Update(seller);
        }, CancellationToken.None);

        return new IntakeResult(articleIds, seller.IntakeFeePaid);
    }
}
