using System.Globalization;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

/// <summary>
/// ';' as the delimiter and ',' as the decimal separator match German Excel's
/// default CSV dialect - a plain '.'/',' file opens with every value crammed
/// into column A otherwise (api/articles.md has no CSV format section; this
/// is the format this feature introduces).
/// </summary>
public static class ArticleCsvWriter
{
    private const string Header = "Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis";
    private static readonly CultureInfo German = CultureInfo.GetCultureInfo("de-DE");

    public static string Write(IReadOnlyList<ArticleExportRow> rows)
    {
        var lines = new List<string> { Header };
        lines.AddRange(rows.Select(FormatRow));
        return string.Join("\r\n", lines) + "\r\n";
    }

    private static string FormatRow(ArticleExportRow row) => string.Join(';', new[]
    {
        row.Number.ToString(CultureInfo.InvariantCulture),
        row.Name ?? "",
        row.Category ?? "",
        row.Brand ?? "",
        row.Size ?? "",
        row.Price.HasValue ? row.Price.Value.ToString("0.00", German) : ""
    });
}
