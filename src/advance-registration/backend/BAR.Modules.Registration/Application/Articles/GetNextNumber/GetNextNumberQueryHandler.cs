using BAR.Modules.Registration.Contracts.Articles;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.Exceptions;
using BAR.Modules.Registration.Domain.Ports;
using BAR.Modules.Operations.Contracts;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Registration.Application.Articles.GetNextNumber;

public sealed class GetNextNumberQueryHandler(IArticleRepository articles, INumberBlockRepository blocks, IOperationsModuleApi operations)
{
    public async Task<NextNumberResultDto> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var numbering = await operations.GetNumberingConfigAsync(cancellationToken);

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
