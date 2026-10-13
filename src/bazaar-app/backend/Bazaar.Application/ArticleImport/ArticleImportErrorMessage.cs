namespace Bazaar.Application.ArticleImport;

public static class ArticleImportErrorMessage
{
    private const int MaxListedErrors = 10;

    public static string Format(IReadOnlyList<ImportRowError> errors)
    {
        var lines = errors.Take(MaxListedErrors).Select(FormatError).ToList();

        var remaining = errors.Count - lines.Count;
        if (remaining > 0) lines.Add($"und {remaining} weitere");

        return string.Join('\n', lines);
    }

    private static string FormatError(ImportRowError error) =>
        error.ArticleNumber is null
            ? $"Zeile {error.RowNumber}: {error.Reason}"
            : $"Zeile {error.RowNumber}, Artikelnummer {error.ArticleNumber}: {error.Reason}";
}
