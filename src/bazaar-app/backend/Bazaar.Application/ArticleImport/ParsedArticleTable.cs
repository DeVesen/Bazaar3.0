namespace Bazaar.Application.ArticleImport;

public sealed record ImportArticleLine(
    int RowNumber,
    int Number,
    string Name,
    string Category,
    string Brand,
    string? Size,
    int Price);

public sealed record ImportRowError(int RowNumber, string? ArticleNumber, string Reason);

public sealed record NumberedRow(int RowNumber, int Number);

public sealed record ParsedArticleTable(
    IReadOnlyList<ImportArticleLine> Lines,
    IReadOnlyList<ImportRowError> Errors,
    IReadOnlyList<NumberedRow> NumberedRows);
