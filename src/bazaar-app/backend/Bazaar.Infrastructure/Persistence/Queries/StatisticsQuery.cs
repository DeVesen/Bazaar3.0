using Bazaar.Domain.Ports;
using Bazaar.Domain.Settlement;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Queries;

/// <summary>
/// Backs GET /api/statistics (api/statistics.md, Round-22) — one Read-Model
/// for the entire Statistik-Seite. Article status derivation mirrors
/// Article.Status (EF Core cannot translate that computed property to SQL,
/// so it is reproduced here as Where/Count/Sum chains): Accepted =
/// ReleasedAt != null, Selling = ReleasedAt != null &amp;&amp; SoldAt == null
/// &amp;&amp; ReturnedAt == null, Sold = SoldAt != null, Returned = ReturnedAt
/// != null.
///
/// `sellerTypeId` filters ONLY the leaderboard — every KPI/finance number is
/// computed over ALL sellers/articles regardless of the filter. Commission is
/// rounded PER SELLER via SettlementCalculation.Calculate (same rounding rule
/// as the settlement slice) and then summed — never rounded once over the
/// combined total, to avoid drift between the per-seller leaderboard payouts
/// and the aggregate KPI. Fees is the actual sum of IntakeFeePaid, never a
/// formula over sold articles. PayoutExpected = GrossIncome - (Commission +
/// Fees) over all sellers, computed here since it needs GrossIncome, which is
/// only available in this layer.
///
/// Not a single SQL statement — four DB roundtrips (article aggregates,
/// per-seller article stats, all sellers, seller-type names) — but no
/// port-boundary violation and no IQueryable leaking out; the per-seller
/// rounding itself happens in C# after materialization ("eine Abfrage" is
/// interpreted architecturally, not literally, per plan.md's own footnote).
/// </summary>
public sealed class StatisticsQuery(BazaarDbContext dbContext) : IStatisticsQuery
{
    public async Task<StatisticsReadModel> Get(string? sellerTypeId)
    {
        var articleAggregates = await dbContext.Articles
            .GroupBy(a => 1)
            .Select(g => new
            {
                Total = g.Count(),
                Accepted = g.Count(a => a.ReleasedAt != null),
                Selling = g.Count(a => a.ReleasedAt != null && a.SoldAt == null && a.ReturnedAt == null),
                Sold = g.Count(a => a.SoldAt != null),
                Returned = g.Count(a => a.ReturnedAt != null),
                AcceptedValue = g.Where(a => a.ReleasedAt != null).Sum(a => (decimal?)a.Price) ?? 0m,
                ReturnedValue = g.Where(a => a.ReturnedAt != null).Sum(a => (decimal?)a.Price) ?? 0m,
                OpenValue = g.Where(a => a.ReleasedAt != null && a.SoldAt == null && a.ReturnedAt == null).Sum(a => (decimal?)a.Price) ?? 0m,
                GrossIncome = g.Where(a => a.SoldAt != null).Sum(a => (decimal?)a.Price) ?? 0m,
                GrossIncomeManual = g.Where(a => a.SoldAt != null && a.SoldManually).Sum(a => (decimal?)a.Price) ?? 0m,
            })
            .SingleOrDefaultAsync();

        var perSellerArticleStats = await dbContext.Articles
            .GroupBy(a => a.SellerId)
            .Select(g => new
            {
                SellerId = g.Key,
                Accepted = g.Count(a => a.ReleasedAt != null),
                Sold = g.Count(a => a.SoldAt != null),
                Revenue = g.Where(a => a.SoldAt != null).Sum(a => (decimal?)a.Price) ?? 0m,
            })
            .ToListAsync();

        var allSellers = await dbContext.Sellers
            .Select(s => new
            {
                s.Id,
                s.FirstName,
                s.LastName,
                s.SellerTypeId,
                s.SalesCommission,
                s.IntakeFeePaid,
                s.SettledAt,
                s.PayoutAmount
            })
            .ToListAsync();

        var sellerTypeNameById = await dbContext.SellerTypes
            .ToDictionaryAsync(t => t.Id, t => t.Name);

        var statsById = perSellerArticleStats.ToDictionary(x => x.SellerId);

        var totalCommission = 0m;
        var payoutSettled = 0m;
        var leaderboard = new List<LeaderboardRowReadModel>();

        foreach (var seller in allSellers)
        {
            statsById.TryGetValue(seller.Id, out var stats);
            var accepted = stats?.Accepted ?? 0;
            var sold = stats?.Sold ?? 0;
            var revenue = stats?.Revenue ?? 0m;

            var (commission, payout) = SettlementCalculation.Calculate(revenue, seller.SalesCommission);
            totalCommission += commission;

            if (seller.SettledAt != null)
            {
                payoutSettled += seller.PayoutAmount ?? 0m;
            }

            if (sellerTypeId == null || seller.SellerTypeId == sellerTypeId)
            {
                leaderboard.Add(new LeaderboardRowReadModel(
                    seller.Id,
                    $"{seller.FirstName} {seller.LastName}",
                    sellerTypeNameById.GetValueOrDefault(seller.SellerTypeId, seller.SellerTypeId),
                    accepted,
                    sold,
                    revenue,
                    payout,
                    seller.SettledAt != null));
            }
        }

        leaderboard = leaderboard.OrderByDescending(row => row.Sold).ToList();

        var totalFees = allSellers.Sum(s => s.IntakeFeePaid);
        var grossIncome = articleAggregates?.GrossIncome ?? 0m;
        var payoutExpected = grossIncome - (totalCommission + totalFees);

        return new StatisticsReadModel(
            TotalCount: articleAggregates?.Total ?? 0,
            AcceptedCount: articleAggregates?.Accepted ?? 0,
            SellingCount: articleAggregates?.Selling ?? 0,
            SoldCount: articleAggregates?.Sold ?? 0,
            ReturnedCount: articleAggregates?.Returned ?? 0,
            AcceptedValue: articleAggregates?.AcceptedValue ?? 0m,
            ReturnedValue: articleAggregates?.ReturnedValue ?? 0m,
            OpenValue: articleAggregates?.OpenValue ?? 0m,
            GrossIncome: grossIncome,
            GrossIncomeManual: articleAggregates?.GrossIncomeManual ?? 0m,
            Commission: totalCommission,
            Fees: totalFees,
            PayoutExpected: payoutExpected,
            PayoutSettled: payoutSettled,
            Leaderboard: leaderboard);
    }
}
