using System.Globalization;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Modules.Registration.Application.Articles.ImportExport;

/// <summary>
/// Pure, DB-free row-by-row decision: which of the 4 actions a row maps to,
/// or which single error stops the whole import (all-or-nothing, spec.md
/// "Import-Zeilenlogik"). Never touches a repository - ImportArticlesCommandHandler
/// (Task 8) supplies the seller's own blocks and already-persisted articles.
/// </summary>
public static class ArticleImportValidator
{
    public static (IReadOnlyList<ImportAction> Actions, IReadOnlyList<ImportRowError> Errors) Validate(
        IReadOnlyList<ImportRawRow> rows, IReadOnlyList<NumberBlock> sellerBlocks, IReadOnlyList<Article> existingArticles)
    {
        var errors = new List<ImportRowError>();
        var actions = new List<ImportAction>();
        var ownNumbers = NumberBlockSequence.AllNumbersOrdered(sellerBlocks).ToHashSet();
        var existingByNumber = existingArticles.ToDictionary(a => a.Number);
        var seenAtLine = new Dictionary<int, int>();

        foreach (var row in rows)
        {
            if (!int.TryParse(row.NumberRaw, NumberStyles.Integer, CultureInfo.InvariantCulture, out var number))
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.invalid_number", $"Zeile {row.LineNumber}: Nummer fehlt oder ist keine Ganzzahl."));
                continue;
            }

            if (!ownNumbers.Contains(number))
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.number_not_in_own_range", $"Zeile {row.LineNumber}: Nummer {number} gehört nicht zum eigenen Nummernkreis."));
                continue;
            }

            if (seenAtLine.TryGetValue(number, out var firstLine))
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.duplicate_number", $"Zeile {row.LineNumber}: Nummer {number} bereits in Zeile {firstLine} vergeben."));
                continue;
            }
            seenAtLine[number] = row.LineNumber;

            var isEmpty = string.IsNullOrWhiteSpace(row.Name) && string.IsNullOrWhiteSpace(row.Category) &&
                          string.IsNullOrWhiteSpace(row.Brand) && string.IsNullOrWhiteSpace(row.Size) && string.IsNullOrWhiteSpace(row.PriceRaw);
            var hasExisting = existingByNumber.ContainsKey(number);

            if (isEmpty)
            {
                actions.Add(new ImportAction(
                    hasExisting ? ImportActionKind.Delete : ImportActionKind.NoOp,
                    number, null, null, null, null, null));
                continue;
            }

            if (string.IsNullOrWhiteSpace(row.Name) || string.IsNullOrWhiteSpace(row.Category) || string.IsNullOrWhiteSpace(row.Brand))
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.missing_field", $"Zeile {row.LineNumber}: Bezeichnung, Kategorie und Marke sind Pflichtfelder."));
                continue;
            }

            if (!decimal.TryParse(row.PriceRaw?.Replace(',', '.'), NumberStyles.Number, CultureInfo.InvariantCulture, out var price) || price <= 0)
            {
                errors.Add(new ImportRowError(row.LineNumber, "import.invalid_price", $"Zeile {row.LineNumber}: Preis fehlt oder ist ungültig."));
                continue;
            }

            actions.Add(new ImportAction(
                hasExisting ? ImportActionKind.Update : ImportActionKind.Create,
                number, row.Name.Trim(), row.Category!.Trim(), row.Brand!.Trim(),
                string.IsNullOrWhiteSpace(row.Size) ? null : row.Size.Trim(), price));
        }

        return (actions, errors);
    }
}
