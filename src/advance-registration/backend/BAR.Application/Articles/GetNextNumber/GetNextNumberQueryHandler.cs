using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Articles;
using BAR.Domain.Ports;

namespace BAR.Application.Articles.GetNextNumber;

public sealed class GetNextNumberQueryHandler(
    IArticleRepository articles, INumberBlockRepository blocks, ISettingsRepository settingsRepository)
{
    public async Task<NextNumberResult> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");

        var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        var used = await articles.GetUsedNumbersForSellerAsync(sellerId, cancellationToken);
        var allBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        try
        {
            var allocation = ArticleNumberAllocator.AllocateNext(
                sellerBlocks, used, allBlocks, sellerId, settings.StartNumber, settings.BlockSize, DateTime.UtcNow);
            return new NextNumberResult(allocation.Number);
        }
        catch (NoFreeRangeException)
        {
            throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");
        }
    }
}
