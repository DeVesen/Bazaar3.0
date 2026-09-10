using BAR.Domain.Ports.Queries;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Queries;

public sealed class HomeQueries(BarDbContext dbContext) : IHomeQueries
{
    public async Task<SellerHomeData?> GetSellerHomeAsync(string sellerId, CancellationToken cancellationToken)
    {
        var typeInfo = await (
            from seller in dbContext.Sellers
            join type in dbContext.SellerTypes on seller.SellerTypeId equals type.Id
            where seller.Id == sellerId
            select new { type.CommissionRate, type.ItemFee })
            .SingleOrDefaultAsync(cancellationToken);

        if (typeInfo is null)
        {
            return null;
        }

        var articleCount = await dbContext.Articles.CountAsync(a => a.SellerId == sellerId, cancellationToken);

        return new SellerHomeData(articleCount, typeInfo.CommissionRate, typeInfo.ItemFee);
    }

    public async Task<AdminHomeData> GetAdminHomeAsync(DateTime heatmapSince, CancellationToken cancellationToken)
    {
        var sellerCount = await dbContext.Sellers.CountAsync(cancellationToken);
        var articleCount = await dbContext.Articles.CountAsync(cancellationToken);
        var categoryCount = await dbContext.Categories.CountAsync(cancellationToken);
        var brandCount = await dbContext.Brands.CountAsync(cancellationToken);

        var createdDates = dbContext.Articles
            .Where(a => a.CreatedAt >= heatmapSince)
            .Select(a => a.CreatedAt.Date);
        var updatedDates = dbContext.Articles
            .Where(a => a.UpdatedAt >= heatmapSince)
            .Select(a => a.UpdatedAt.Date);

        var counts = await createdDates.Concat(updatedDates)
            .GroupBy(date => date)
            .Select(g => new { Date = g.Key, Count = g.Count() })
            .ToListAsync(cancellationToken);

        var heatmapData = counts
            .Select(c => new HeatmapDay(DateOnly.FromDateTime(c.Date), c.Count))
            .OrderBy(d => d.Date)
            .ToList();

        return new AdminHomeData(sellerCount, articleCount, categoryCount, brandCount, heatmapData);
    }
}
