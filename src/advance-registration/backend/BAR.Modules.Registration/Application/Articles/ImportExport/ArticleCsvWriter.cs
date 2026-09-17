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
        QuoteIfNeeded(row.Name),
        QuoteIfNeeded(row.Category),
        QuoteIfNeeded(row.Brand),
        QuoteIfNeeded(row.Size),
        row.Price.HasValue ? row.Price.Value.ToString("0.00", German) : ""
    });

    /// <summary>
    /// RFC-4180-style quoting: a field is wrapped in "..." (internal " doubled
    /// to "") only if it contains the delimiter, a quote, or a line break -
    /// otherwise it stays unquoted so the common case and existing tests are
    /// unaffected. Without this, a stray ';' or newline in free text (Name/
    /// Category/Brand/Size) shifts all following columns on export and breaks
    /// re-import (see ArticleImportFileParser's counterpart un-quoting).
    /// </summary>
    private static string QuoteIfNeeded(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return "";
        }
        if (value.IndexOfAny([';', '"', '\r', '\n']) < 0)
        {
            return value;
        }
        return $"\"{value.Replace("\"", "\"\"")}\"";
    }
}
