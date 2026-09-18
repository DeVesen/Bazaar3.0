using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

/// <summary>
/// Backs GET /api/sellers (spec.md://api/sellers.md §1). All four counters
/// (articleCount/releasedCount/soldCount/returnedCount) and all three money
/// fields (acceptedValue/openValue/revenue) are real aggregations over the
/// Articles table, joined in per seller (see seller-card.md §3 for the
/// formulas).
///
/// `status` filtering is real and three-way, derived from `SettledAt` and
/// whether the seller has at least one released article (see seller-card.md
/// §2's Status-Badge table): `status=settled` → `SettledAt != null`;
/// `status=selling` → not settled and `releasedCount > 0`; `status=open` →
/// not settled and `releasedCount == 0`. `status=null`/empty applies no
/// filter.
///
/// `q` uses the same token search as SellerSearchQuery
/// (FirstName/LastName/Id/City — see SellerTokenSearch), matching the
/// doc's "ID, Vor- und Nachname, Ort" wording.
///
/// Sorting: `sort` is "field:direction" (default "name:asc"). Only "name"
/// actually reorders results — acceptedValue/openValue/revenue sorting is
/// out of scope for this round and remain a no-op/stable pass-through
/// (existing enumeration order is preserved).
/// </summary>
public sealed class SellerCardsQuery(BazaarDbContext dbContext) : ISellerCardsQuery
{
    private const int DefaultPageSize = 60;

    // Upper bound so a caller-supplied pageSize (e.g. 100000) can't force the
    // whole sellers table to be materialized in one page.
    private const int MaxPageSize = 200;

    public async Task<SellerCardsPage> GetCards(string? q, string? status, string? sort, int page, int pageSize)
    {
        var effectivePageSize = pageSize > 0 ? Math.Min(pageSize, MaxPageSize) : DefaultPageSize;
        var effectivePage = page > 0 ? page : 1;

        var sellers = await (
            from seller in dbContext.Sellers
            join sellerType in dbContext.SellerTypes on seller.SellerTypeId equals sellerType.Id
            select new
            {
                seller.Id,
                seller.FirstName,
                seller.LastName,
                seller.PostalCode,
                seller.City,
                SellerType = sellerType.Name,
                seller.SettledAt
            })
            .ToListAsync();

        var articleStats = await dbContext.Articles
            .GroupBy(a => a.SellerId)
            .Select(g => new
            {
                SellerId = g.Key,
                ArticleCount = g.Count(),
                ReleasedCount = g.Count(a => a.ReleasedAt != null),
                SoldCount = g.Count(a => a.SoldAt != null),
                ReturnedCount = g.Count(a => a.ReturnedAt != null),
                AcceptedValue = g.Where(a => a.ReleasedAt != null).Sum(a => a.Price),
                OpenValue = g.Where(a => a.ReleasedAt != null && a.SoldAt == null && a.ReturnedAt == null).Sum(a => a.Price),
                Revenue = g.Where(a => a.SoldAt != null).Sum(a => a.Price),
            })
            .ToDictionaryAsync(x => x.SellerId);

        var tokens = SellerTokenSearch.Tokenize(q);
        var textFiltered = tokens.Length == 0
            ? sellers
            : sellers.Where(s => SellerTokenSearch.Matches(tokens, s.FirstName, s.LastName, s.Id, s.City)).ToList();

        var filtered = ApplyStatusFilter(
            textFiltered,
            status,
            s => s.SettledAt,
            s => articleStats.GetValueOrDefault(s.Id)?.ReleasedCount ?? 0);

        var (sortField, descending) = ParseSort(sort);

        // acceptedValue/openValue/revenue: no-op pass-through, see class summary
        // — only "name" actually reorders the list.
        var ordered = sortField == "name"
            ? (descending
                ? filtered.OrderByDescending(s => s.LastName, StringComparer.OrdinalIgnoreCase)
                    .ThenByDescending(s => s.FirstName, StringComparer.OrdinalIgnoreCase)
                    .ToList()
                : filtered.OrderBy(s => s.LastName, StringComparer.OrdinalIgnoreCase)
                    .ThenBy(s => s.FirstName, StringComparer.OrdinalIgnoreCase)
                    .ToList())
            : filtered;

        var totalCount = ordered.Count;
        var items = ordered
            .Skip((effectivePage - 1) * effectivePageSize)
            .Take(effectivePageSize)
            .Select(s =>
            {
                var stats = articleStats.GetValueOrDefault(s.Id);
                var releasedCount = stats?.ReleasedCount ?? 0;

                return new SellerCard(
                    s.Id,
                    s.FirstName,
                    s.LastName,
                    s.PostalCode,
                    s.City,
                    s.SellerType,
                    Status: s.SettledAt != null ? "settled" : (releasedCount > 0 ? "selling" : "open"),
                    ArticleCount: stats?.ArticleCount ?? 0,
                    ReleasedCount: releasedCount,
                    SoldCount: stats?.SoldCount ?? 0,
                    ReturnedCount: stats?.ReturnedCount ?? 0,
                    AcceptedValue: stats?.AcceptedValue ?? 0m,
                    OpenValue: stats?.OpenValue ?? 0m,
                    Revenue: stats?.Revenue ?? 0m,
                    s.SettledAt);
            })
            .ToList();

        return new SellerCardsPage(items, totalCount, effectivePage, effectivePageSize);
    }

    /// <summary>
    /// Filters by the `status` query parameter. `settled` is derived from
    /// `SettledAt`; `selling`/`open` split on whether the seller has at
    /// least one released article (`releasedCountOf`) — see class summary.
    /// </summary>
    private static List<T> ApplyStatusFilter<T>(
        List<T> sellers,
        string? status,
        Func<T, DateTimeOffset?> settledAtOf,
        Func<T, int> releasedCountOf)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return sellers;
        }

        return status switch
        {
            "settled" => sellers.Where(s => settledAtOf(s) != null).ToList(),
            "selling" => sellers.Where(s => settledAtOf(s) == null && releasedCountOf(s) > 0).ToList(),
            "open" => sellers.Where(s => settledAtOf(s) == null && releasedCountOf(s) == 0).ToList(),
            _ => sellers
        };
    }

    private static (string Field, bool Descending) ParseSort(string? sort)
    {
        if (string.IsNullOrWhiteSpace(sort))
        {
            return ("name", false);
        }

        var parts = sort.Split(':', 2);
        var field = parts[0];
        var descending = parts.Length > 1 && string.Equals(parts[1], "desc", StringComparison.OrdinalIgnoreCase);
        return (field, descending);
    }
}
