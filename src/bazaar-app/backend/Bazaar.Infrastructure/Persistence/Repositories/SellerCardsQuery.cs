using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

// TODO(Round-15): counters/sums gegen echte Artikel-Daten implementieren; status-Split open/selling
/// <summary>
/// Backs GET /api/sellers (spec.md://api/sellers.md §1). This round has no
/// Articles table yet, so everything article-derived is a hardcoded
/// placeholder: all four counters (articleCount/releasedCount/soldCount/
/// returnedCount) and all three money fields (acceptedValue/openValue/
/// revenue) are 0.
///
/// `status` filtering IS real this round, derived from `SettledAt` alone:
/// `status=settled` returns sellers with `SettledAt != null`; `status=open`
/// and `status=selling` both currently return the same set — sellers with
/// `SettledAt == null` — because splitting "open" from "selling" requires
/// knowing whether a seller has at least one released article, which
/// doesn't exist until Round-15 (see TODO above). `status=null`/empty
/// applies no filter.
///
/// `q` uses the same token search as SellerSearchQuery
/// (FirstName/LastName/Id/City — see SellerTokenSearch), matching the
/// doc's "ID, Vor- und Nachname, Ort" wording.
///
/// Sorting: `sort` is "field:direction" (default "name:asc"). Since
/// acceptedValue/openValue/revenue are placeholder-constant 0 in this
/// round, sorting by them would be meaningless either way, so those three
/// options are a no-op/stable pass-through (existing enumeration order is
/// preserved) — only "name" actually reorders results.
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

        var tokens = SellerTokenSearch.Tokenize(q);
        var textFiltered = tokens.Length == 0
            ? sellers
            : sellers.Where(s => SellerTokenSearch.Matches(tokens, s.FirstName, s.LastName, s.Id, s.City)).ToList();

        var filtered = ApplyStatusFilter(textFiltered, status, s => s.SettledAt);

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
            .Select(s => new SellerCard(
                s.Id,
                s.FirstName,
                s.LastName,
                s.PostalCode,
                s.City,
                s.SellerType,
                // "settled" is fully derivable from SettledAt alone (no article
                // dependency); "open" is the Round-15 TODO placeholder for
                // everything that isn't settled — see class summary for why
                // "open" vs. "selling" can't split yet.
                Status: s.SettledAt != null ? "settled" : "open",
                ArticleCount: 0,
                ReleasedCount: 0,
                SoldCount: 0,
                ReturnedCount: 0,
                AcceptedValue: 0m,
                OpenValue: 0m,
                Revenue: 0m,
                s.SettledAt))
            .ToList();

        return new SellerCardsPage(items, totalCount, effectivePage, effectivePageSize);
    }

    /// <summary>
    /// Filters by the `status` query parameter. Fully real for "settled"
    /// (derived straight from SettledAt); "open" and "selling" currently
    /// resolve to the identical non-settled set until Round-15 can tell them
    /// apart via released articles — see class summary.
    /// </summary>
    private static List<T> ApplyStatusFilter<T>(List<T> sellers, string? status, Func<T, DateTimeOffset?> settledAtOf)
    {
        if (string.IsNullOrWhiteSpace(status))
        {
            return sellers;
        }

        return status switch
        {
            "settled" => sellers.Where(s => settledAtOf(s) != null).ToList(),
            "open" or "selling" => sellers.Where(s => settledAtOf(s) == null).ToList(),
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
