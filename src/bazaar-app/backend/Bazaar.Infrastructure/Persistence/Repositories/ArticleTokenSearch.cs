namespace Bazaar.Infrastructure.Persistence.Repositories;

/// <summary>
/// Shared token-decomposition search helper for the article free-text search
/// rules from api/articles.md §1 ("Freitext über Nummer, Bezeichnung, Marke,
/// Kategorie und Verkäufername") — see ArticleListQuery for the full rule
/// writeup. Mirrors SellerTokenSearch's shape exactly, kept as its own small
/// type (rather than reusing SellerTokenSearch) because its name and doc
/// comment are scoped to article fields, not seller fields.
/// </summary>
internal static class ArticleTokenSearch
{
    public static string[] Tokenize(string? query) =>
        (query ?? string.Empty).Split(' ', StringSplitOptions.RemoveEmptyEntries);

    public static bool Matches(string[] tokens, params string?[] fields) =>
        tokens.All(token => fields.Any(field => field is not null && field.Contains(token, StringComparison.OrdinalIgnoreCase)));
}
