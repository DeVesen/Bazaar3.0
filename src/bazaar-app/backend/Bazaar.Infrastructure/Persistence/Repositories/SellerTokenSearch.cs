namespace Bazaar.Infrastructure.Persistence.Repositories;

/// <summary>
/// Shared token-decomposition search helper for the seller ILIKE-style
/// search rules from spec.md://api/cross-cutting.md §6 (see
/// SellerSearchQuery for the full rule writeup). Used by both
/// SellerSearchQuery and SellerCardsQuery so the "split on spaces, OR
/// across fields per token, AND across tokens" logic is defined once.
/// <see cref="Matches"/> is field-agnostic — callers pass whichever fields
/// should be OR'd per token; both call sites (SellerSearchQuery,
/// SellerCardsQuery) pass FirstName/LastName/Id/City, matching
/// api/sellers.md §1's "Freitext über ID, Vor- und Nachname, Ort".
/// </summary>
internal static class SellerTokenSearch
{
    public static string[] Tokenize(string? query) =>
        (query ?? string.Empty).Split(' ', StringSplitOptions.RemoveEmptyEntries);

    public static bool Matches(string[] tokens, params string?[] fields) =>
        tokens.All(token => fields.Any(field => field is not null && field.Contains(token, StringComparison.OrdinalIgnoreCase)));
}
