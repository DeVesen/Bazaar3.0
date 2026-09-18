using Bazaar.Domain.Articles;
using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

/// <summary>
/// Backs GET /api/articles (api/articles.md §1). Search rules: token-decompose
/// the incoming query on spaces, each token must match (case-insensitively,
/// substring) at least one of Number (as string)/Name/Brand/Category/
/// SellerName (OR across fields), and every token must find a match
/// somewhere, independently (AND across tokens) — see ArticleTokenSearch.
///
/// Design decision: filtering happens client-side (after materializing the
/// candidate rows) via string.Contains(..., StringComparison.OrdinalIgnoreCase)
/// rather than EF.Functions.ILike. There is no prior ILIKE usage anywhere in
/// this codebase to follow as precedent, whereas OrdinalIgnoreCase is the
/// established case-insensitivity idiom in the Application layer. It also
/// keeps this query provider-agnostic, matching the existing Infrastructure
/// test convention of UseInMemoryDatabase (the InMemory provider cannot
/// translate EF.Functions.ILike, which is Npgsql-specific). The dataset size
/// for a single Basar makes the lack of DB-side filtering a non-issue.
///
/// Sorting: `sort` is a comma-separated multi-key list, `field1:dir1,field2:dir2`
/// (cross-cutting.md §6) — the first field is the highest sort priority,
/// `asc`/`desc` per field (default `asc` if omitted). Default when `sort` is
/// empty/missing is `number:asc` (api/articles.md §1). Unlike
/// SellerCardsQuery.ParseSort (single-field only), this query implements the
/// general multi-key form since the table component built in Task 6 sends
/// genuine multi-sort (Shift+click) parameter values.
/// </summary>
public sealed class ArticleListQuery(BazaarDbContext dbContext) : IArticleListQuery
{
    private const int DefaultPageSize = 50;

    // Upper bound so a caller-supplied pageSize (e.g. 100000) can't force the
    // whole articles table to be materialized in one page.
    private const int MaxPageSize = 200;

    public async Task<ArticleListPage> GetArticles(string? q, string? brand, string? category, string? status, string? sort, int page, int pageSize)
    {
        var effectivePageSize = pageSize > 0 ? Math.Min(pageSize, MaxPageSize) : DefaultPageSize;
        var effectivePage = page > 0 ? page : 1;

        var articles = await (
            from article in dbContext.Articles
            join seller in dbContext.Sellers on article.SellerId equals seller.Id
            select new ArticleRow(
                article.Id,
                article.Number,
                article.Name,
                article.Brand,
                article.Category,
                article.Price,
                article.SoldManually,
                article.SellerId,
                seller.FirstName + " " + seller.LastName,
                // Status is computed CLR-side — pull the enum through, stringify after materializing.
                article.Status))
            .ToListAsync();

        var tokens = ArticleTokenSearch.Tokenize(q);
        var textFiltered = tokens.Length == 0
            ? articles
            : articles.Where(a => ArticleTokenSearch.Matches(tokens, a.Number.ToString(), a.Name, a.Brand, a.Category, a.SellerName)).ToList();

        var brandFiltered = string.IsNullOrWhiteSpace(brand)
            ? textFiltered
            : textFiltered.Where(a => string.Equals(a.Brand, brand, StringComparison.OrdinalIgnoreCase)).ToList();

        var categoryFiltered = string.IsNullOrWhiteSpace(category)
            ? brandFiltered
            : brandFiltered.Where(a => string.Equals(a.Category, category, StringComparison.OrdinalIgnoreCase)).ToList();

        var statusFiltered = string.IsNullOrWhiteSpace(status)
            ? categoryFiltered
            : categoryFiltered.Where(a => string.Equals(a.StatusEnum.ToString(), status, StringComparison.OrdinalIgnoreCase)).ToList();

        var sortKeys = ParseSort(sort);
        var ordered = ApplySort(statusFiltered, sortKeys);

        var totalCount = ordered.Count;
        var items = ordered
            .Skip((effectivePage - 1) * effectivePageSize)
            .Take(effectivePageSize)
            .Select(a => new ArticleListItem(
                a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price,
                a.StatusEnum.ToString().ToLowerInvariant(), a.SoldManually,
                a.SellerId, a.SellerName))
            .ToList();

        return new ArticleListPage(items, totalCount, effectivePage, effectivePageSize);
    }

    private static IReadOnlyList<(string Field, bool Descending)> ParseSort(string? sort)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return [("number", false)];
        }

        return sort.Split(',', StringSplitOptions.RemoveEmptyEntries)
            .Select(part =>
            {
                var pieces = part.Split(':', 2);
                var field = pieces[0].Trim();
                var descending = pieces.Length > 1 && string.Equals(pieces[1].Trim(), "desc", StringComparison.OrdinalIgnoreCase);
                return (field, descending);
            })
            .ToList();
    }

    /// <summary>
    /// Applies each sort key in order via OrderBy/ThenBy (first key via
    /// OrderBy/OrderByDescending, every subsequent key via
    /// ThenBy/ThenByDescending), switching on the field name to pick the
    /// right selector. StringComparer.OrdinalIgnoreCase is used for all
    /// string fields, matching SellerCardsQuery.ParseSort's comparer choice.
    /// An unrecognized field name is a no-op for that key (skipped), not a
    /// throw.
    /// </summary>
    private static List<ArticleRow> ApplySort(List<ArticleRow> items, IReadOnlyList<(string Field, bool Descending)> sortKeys)
    {
        IOrderedEnumerable<ArticleRow>? ordered = null;

        foreach (var (field, descending) in sortKeys)
        {
            switch (field)
            {
                case "number":
                    ordered = Chain(ordered, items, a => a.Number, descending, Comparer<int>.Default);
                    break;
                case "name":
                    ordered = Chain(ordered, items, a => a.Name, descending, StringComparer.OrdinalIgnoreCase);
                    break;
                case "category":
                    ordered = Chain(ordered, items, a => a.Category, descending, StringComparer.OrdinalIgnoreCase);
                    break;
                case "brand":
                    ordered = Chain(ordered, items, a => a.Brand, descending, StringComparer.OrdinalIgnoreCase);
                    break;
                case "price":
                    ordered = Chain(ordered, items, a => a.Price, descending, Comparer<decimal>.Default);
                    break;
                case "status":
                    ordered = Chain(ordered, items, a => a.StatusEnum.ToString(), descending, StringComparer.OrdinalIgnoreCase);
                    break;
                case "sellerName":
                    ordered = Chain(ordered, items, a => a.SellerName, descending, StringComparer.OrdinalIgnoreCase);
                    break;
                default:
                    // Unrecognized field name — no-op for this key.
                    break;
            }
        }

        return (ordered ?? items.AsEnumerable()).ToList();
    }

    private static IOrderedEnumerable<ArticleRow> Chain<TKey>(
        IOrderedEnumerable<ArticleRow>? previous,
        List<ArticleRow> items,
        Func<ArticleRow, TKey> keySelector,
        bool descending,
        IComparer<TKey> comparer) =>
        previous is null
            ? (descending ? items.OrderByDescending(keySelector, comparer) : items.OrderBy(keySelector, comparer))
            : (descending ? previous.ThenByDescending(keySelector, comparer) : previous.ThenBy(keySelector, comparer));

    private sealed record ArticleRow(
        string Id,
        int Number,
        string Name,
        string Brand,
        string Category,
        decimal Price,
        bool SoldManually,
        string SellerId,
        string SellerName,
        ArticleStatus StatusEnum);
}
