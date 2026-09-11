using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Modules.Anmeldung.Domain.Articles;
using BAR.Modules.Anmeldung.Domain.Exceptions;
using BAR.Modules.Anmeldung.Domain.Ports;
using BAR.Modules.Betrieb.Contracts;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Anmeldung.Application.Articles.GetNextNumber;

public sealed class GetNextNumberQueryHandler(IArticleRepository articles, INumberBlockRepository blocks, IBetriebModuleApi betrieb)
{
    public async Task<NextNumberResultDto> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var numbering = await betrieb.GetNumberingConfigAsync(cancellationToken);

        var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        var used = await articles.GetUsedNumbersForSellerAsync(sellerId, cancellationToken);
        var allBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);

        try
        {
            var allocation = ArticleNumberAllocator.AllocateNext(
                sellerBlocks, used, allBlocks, sellerId, numbering.StartNumber, numbering.BlockSize, DateTime.UtcNow);
            return new NextNumberResultDto(allocation.Number);
        }
        catch (NoFreeRangeException)
        {
            throw new ConflictException("article.no_free_number", "Keine freie Artikelnummer verfügbar — bitte Admin kontaktieren");
        }
    }
}
