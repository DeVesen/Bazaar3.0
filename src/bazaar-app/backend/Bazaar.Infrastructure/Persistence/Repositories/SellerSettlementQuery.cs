using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence.Repositories;

/// <summary>
/// Backs GET /api/sellers/{id}/settlement (api/settlement.md, Round-20).
/// Aggregates <see cref="BazaarDbContext.Articles"/> for a single seller —
/// same status derivation as <see cref="SellerCardsQuery"/> (Round-15) but
/// scoped to one seller instead of a page, and with the field set the
/// settlement view needs (OpenCount/SoldCount/ReturnedCount/Revenue/
/// NotDeliveredCount) rather than SellerCardsQuery's ArticleCount/
/// AcceptedValue/OpenValue set.
///
/// Field derivation (see <see cref="ISellerSettlementQuery"/> and
/// Article.Status): OpenCount = released, not sold, not returned (i.e.
/// Selling status — "freigegeben, noch im Verkauf"). SoldCount/ReturnedCount
/// count SoldAt/ReturnedAt regardless of ReleasedAt (can't happen without it
/// per Article's own cascade invariant, but counting the timestamp directly
/// mirrors SellerCardsQuery's style). Revenue sums Price where SoldAt != null.
/// NotDeliveredCount counts pre-registered articles never released to the
/// Basar (ReleasedAt == null).
///
/// Seller settlement fields (CommissionRate/IntakeFeePaid/SettledAt/
/// PayoutAmount) are read straight off the Seller record — CommissionRate is
/// Seller.SalesCommission, never derived from the seller's current
/// SellerType. Returns null when no seller with the given id exists; the 404
/// mapping is GetSellerSettlementHandler's job, not this layer's.
/// </summary>
public sealed class SellerSettlementQuery(BazaarDbContext dbContext) : ISellerSettlementQuery
{
    public async Task<SellerSettlementReadModel?> GetSettlement(string sellerId)
    {
        var seller = await dbContext.Sellers
            .Where(s => s.Id == sellerId)
            .Select(s => new
            {
                s.Id,
                s.FirstName,
                s.LastName,
                s.Address,
                s.PostalCode,
                s.City,
                s.SalesCommission,
                s.IntakeFeePaid,
                s.SettledAt,
                s.PayoutAmount
            })
            .SingleOrDefaultAsync();

        if (seller is null)
        {
            return null;
        }

        var stats = await dbContext.Articles
            .Where(a => a.SellerId == sellerId)
            .GroupBy(a => a.SellerId)
            .Select(g => new
            {
                OpenCount = g.Count(a => a.ReleasedAt != null && a.SoldAt == null && a.ReturnedAt == null),
                SoldCount = g.Count(a => a.SoldAt != null),
                ReturnedCount = g.Count(a => a.ReturnedAt != null),
                Revenue = g.Where(a => a.SoldAt != null).Sum(a => a.Price),
                NotDeliveredCount = g.Count(a => a.ReleasedAt == null)
            })
            .SingleOrDefaultAsync();

        return new SellerSettlementReadModel(
            seller.Id,
            seller.FirstName,
            seller.LastName,
            seller.Address,
            seller.PostalCode,
            seller.City,
            OpenCount: stats?.OpenCount ?? 0,
            SoldCount: stats?.SoldCount ?? 0,
            ReturnedCount: stats?.ReturnedCount ?? 0,
            Revenue: stats?.Revenue ?? 0m,
            CommissionRate: seller.SalesCommission,
            IntakeFeePaid: seller.IntakeFeePaid,
            NotDeliveredCount: stats?.NotDeliveredCount ?? 0,
            seller.SettledAt,
            seller.PayoutAmount);
    }
}
