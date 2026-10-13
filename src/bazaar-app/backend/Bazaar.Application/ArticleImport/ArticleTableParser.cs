using System.Globalization;

namespace Bazaar.Application.ArticleImport;

/// <summary>
/// Prüft die Zeilen einer Artikel-Importdatei (Zeile 1 = Kopfzeile, danach ein Artikel je Zeile) gegen die
/// Soll-Vorgaben der Spec und liefert gültige Zeilen und alle Fehler. Reine Funktion, kein Zugriff auf Ports.
/// Spalten in fester Reihenfolge: Artikelnummer, Bezeichnung, Kategorie, Marke, Größe, Preis.
/// </summary>
public static class ArticleTableParser
{
    private const int NumberColumn = 0;
    private const int NameColumn = 1;
    private const int CategoryColumn = 2;
    private const int BrandColumn = 3;
    private const int SizeColumn = 4;
    private const int PriceColumn = 5;
    private const int ColumnCount = 6;
    private const int FirstDataRowIndex = 1;

    private static readonly (int Column, string Label)[] RequiredColumns =
    [
        (NumberColumn, "Artikelnummer"),
        (NameColumn, "Bezeichnung"),
        (CategoryColumn, "Kategorie"),
        (BrandColumn, "Marke"),
        (PriceColumn, "Preis"),
    ];

    public static ParsedArticleTable Parse(IReadOnlyList<IReadOnlyList<object?>> rows, CultureInfo culture)
    {
        var lines = new List<ImportArticleLine>();
        var errors = new List<ImportRowError>();
        var numberedRows = new List<NumberedRow>();
        var seenNumbers = new HashSet<int>();

        for (var index = FirstDataRowIndex; index < rows.Count; index++)
        {
            var cells = ReadCells(rows[index]);
            if (IsSkippable(cells)) continue;

            var rowNumber = index + 1;
            var result = ParseRow(rowNumber, cells, culture, seenNumbers);
            errors.AddRange(result.Errors);
            if (result.Line is not null) lines.Add(result.Line);
            if (result.Number is { } number) numberedRows.Add(new NumberedRow(rowNumber, number));
        }

        return new ParsedArticleTable(lines, errors, numberedRows);
    }

    private static string?[] ReadCells(IReadOnlyList<object?> row) =>
        Enumerable.Range(0, ColumnCount)
            .Select(column => column < row.Count ? TextOf(row[column]) : null)
            .ToArray();

    private static string? TextOf(object? cell)
    {
        var text = cell switch
        {
            null => null,
            string value => value,
            double number => number.ToString(CultureInfo.InvariantCulture),
            _ => Convert.ToString(cell, CultureInfo.InvariantCulture),
        };

        return string.IsNullOrWhiteSpace(text) ? null : text.Trim();
    }

    /// <summary>
    /// Eine Zeile, die außer der Artikelnummer nur leere Felder hat, gilt als leer — das schließt eine Zeile
    /// ohne jeden Inhalt ein.
    /// </summary>
    private static bool IsSkippable(string?[] cells) => cells.Skip(1).All(cell => cell is null);

    private static RowResult ParseRow(int rowNumber, string?[] cells, CultureInfo culture, HashSet<int> seenNumbers)
    {
        var reasons = MissingFieldReasons(cells);
        var number = ParseNumber(cells[NumberColumn], seenNumbers, reasons);
        var price = ParsePrice(cells[PriceColumn], culture, reasons);

        if (reasons.Count > 0)
        {
            var errors = reasons.Select(reason => new ImportRowError(rowNumber, cells[NumberColumn], reason)).ToList();
            return new RowResult(null, errors, number);
        }

        var line = new ImportArticleLine(
            rowNumber,
            number!.Value,
            cells[NameColumn]!,
            cells[CategoryColumn]!,
            cells[BrandColumn]!,
            cells[SizeColumn],
            price!.Value);
        return new RowResult(line, [], number);
    }

    private static List<string> MissingFieldReasons(string?[] cells) =>
        RequiredColumns
            .Where(required => cells[required.Column] is null)
            .Select(required => $"Pflichtfeld \u201e{required.Label}\u201c fehlt")
            .ToList();

    private static int? ParseNumber(string? text, HashSet<int> seenNumbers, List<string> reasons)
    {
        if (text is null) return null;

        if (!int.TryParse(text, NumberStyles.AllowLeadingSign, CultureInfo.InvariantCulture, out var number))
        {
            reasons.Add("Artikelnummer ist keine Ganzzahl");
            return null;
        }

        if (number <= 0)
        {
            reasons.Add("Artikelnummer muss gr\u00f6\u00dfer als 0 sein");
            return null;
        }

        if (!seenNumbers.Add(number))
        {
            reasons.Add("Artikelnummer kommt in der Datei doppelt vor");
            return null;
        }

        return number;
    }

    private static int? ParsePrice(string? text, CultureInfo culture, List<string> reasons)
    {
        if (text is null) return null;

        var isWholePrice = decimal.TryParse(text, NumberStyles.AllowDecimalPoint, culture, out var price)
            && price == decimal.Truncate(price)
            && price > 0
            && price <= int.MaxValue;
        if (!isWholePrice)
        {
            reasons.Add("Preis muss eine Ganzzahl gr\u00f6\u00dfer als 0 sein");
            return null;
        }

        return (int)price;
    }

    private sealed record RowResult(ImportArticleLine? Line, IReadOnlyList<ImportRowError> Errors, int? Number);
}
