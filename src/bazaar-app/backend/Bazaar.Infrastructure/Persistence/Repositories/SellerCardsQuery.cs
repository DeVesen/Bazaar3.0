using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

// TODO(Round-15): status/counters/sums gegen echte Artikel-Daten implementieren
/// <summary>
/// Backs GET /api/sellers (spec.md://api/sellers.md §1). This round has no
/// Articles table yet, so everything article-derived is a hardcoded
/// placeholder: `status` is always "open" (a caller filtering by e.g.
/// "settled" gets zero results until Round-15 wires this up for real), all
/// four counters (articleCount/releasedCount/soldCount/returnedCount) and
/// all three money fields (acceptedValue/openValue/revenue) are 0.
///
/// `q` uses the same 3-field (FirstName/LastName/Id) token search as
/// SellerSearchQuery — not the doc's broader "ID, Vor- und Nachname, Ort"
/// wording, per this task's brief, which pins GetCards' q-filtering to
/// "same ILIKE/token logic as SellerSearchQuery"; extending to City is left
/// for a later round if needed.
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

    public async Task<SellerCardsPage> GetCards(string? q, string? status, string? sort, int page, int pageSize)
    {
        var effectivePageSize = pageSize > 0 ? pageSize : DefaultPageSize;
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
        var filtered = tokens.Length == 0
            ? sellers
            : sellers.Where(s => SellerTokenSearch.Matches(tokens, s.FirstName, s.LastName, s.Id)).ToList();

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
                Status: "open",
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
