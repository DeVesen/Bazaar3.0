using BAR.Modules.Registration.Domain.Articles;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

public static class ArticleExportRowBuilder
{
    public static IReadOnlyList<ArticleExportRow> BuildExportRows(IReadOnlyList<int> allNumbers, IReadOnlyList<Article> articles)
    {
        var byNumber = articles.ToDictionary(a => a.Number);
        return allNumbers
            .Select(n => byNumber.TryGetValue(n, out var a)
                ? new ArticleExportRow(n, a.Name, a.Category, a.Brand, a.Size, a.Price)
                : new ArticleExportRow(n, null, null, null, null, null))
            .ToList();
    }

    public static IReadOnlyList<ArticleExportRow> BuildTemplateRows(IReadOnlyList<int> allNumbers) =>
        allNumbers.Select(n => new ArticleExportRow(n, null, null, null, null, null)).ToList();
}
