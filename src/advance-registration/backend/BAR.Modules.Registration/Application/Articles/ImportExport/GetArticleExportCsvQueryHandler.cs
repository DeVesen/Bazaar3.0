using BAR.Modules.Registration.Domain.NumberBlocks;
using BAR.Modules.Registration.Domain.Ports;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public sealed class GetArticleExportCsvQueryHandler(IArticleRepository articles, INumberBlockRepository blocks)
{
    public async Task<string> HandleAsync(string sellerId, CancellationToken cancellationToken)
    {
        var sellerBlocks = await blocks.GetForSellerAsync(sellerId, cancellationToken);
        var allNumbers = NumberBlockSequence.AllNumbersOrdered(sellerBlocks);
        var sellerArticles = await articles.GetAllForSellerAsync(sellerId, cancellationToken);
        var rows = ArticleExportRowBuilder.BuildExportRows(allNumbers, sellerArticles);
        return ArticleCsvWriter.Write(rows);
    }
}
