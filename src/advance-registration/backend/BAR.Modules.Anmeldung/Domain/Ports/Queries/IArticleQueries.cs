using BAR.Modules.Anmeldung.Domain.Articles;

namespace BAR.Modules.Anmeldung.Domain.Ports.Queries;

public sealed record ArticleSearchPage(IReadOnlyList<Article> Items, int TotalCount);

public interface IArticleQueries
{
    Task<ArticleSearchPage> SearchMineAsync(
        string sellerId, string? brand, string? category, string? search,
        int page, int pageSize, string? sort, CancellationToken cancellationToken);

    /// <summary>
    /// <paramref name="searchMatchingSellerIds"/>: vorab (per Contracts-Aufruf an
    /// Verkaeuferverwaltung) ermittelte Verkaeufer, deren Name auf
    /// <paramref name="search"/> passt - Ersatz fuer den frueheren SQL-Join
    /// gegen die Seller-Tabelle, die seit dem Modulith-Schnitt in einem
    /// anderen Schema liegt. <c>sort: "seller"</c> wird mangels Namens-Feld in
    /// diesem Schema wie kein Sort behandelt (Fallback auf Nummer) - dieselbe
    /// Fallback-Regel wie fuer jeden unbekannten Sort-Wert.
    /// </summary>
    Task<ArticleSearchPage> SearchAllAsync(
        string? brand, string? category, string? search, string? sellerId,
        IReadOnlyCollection<string>? searchMatchingSellerIds,
        int page, int pageSize, string? sort, CancellationToken cancellationToken);
}
