namespace Bazaar.Application.Import;

/// <summary>
/// The <c>200 OK</c> response body of <c>POST /api/import</c> (api/import.md
/// section 2) — field names/casing match the JSON contract 1:1
/// (System.Text.Json's default camelCase policy lowercases these).
/// </summary>
public sealed record RunImportResult(
    int ImportedSellers,
    int ImportedArticles,
    int SkippedSellers,
    int ImportedBrands,
    int ImportedCategories);
