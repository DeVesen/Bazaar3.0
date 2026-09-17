using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed class GetArticleTemplateCsvQueryHandler(INumberBlockRepository blocks)
{
    public async Task<string> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        var allNumbers = NumberBlockSequence.AllNumbersOrdered(sellerBlocks);
        var rows = ArticleExportRowBuilder.BuildTemplateRows(allNumbers);
        return ArticleCsvWriter.Write(rows);
    }
}
