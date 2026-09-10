using BAR.Domain.Ports.Queries;
using BAR.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using System.Linq.Dynamic.Core;

namespace BAR.Infrastructure.Persistence.Queries;

public sealed class SellerListQuery(BarDbContext dbContext) : ISellerListQuery
{
    // Feste Zuordnung API-Feldname -> Property-Pfad auf SellerSortRow; nur
    // diese neun Felder sind laut api/sellers.md Abschnitt 1 sortierbar. Ein
    // Client-String erreicht Dynamic LINQ nie direkt - nur der gemappte Pfad.
    private static readonly Dictionary<string, string> SortFieldMap = new()
    {
        ["startNumber"] = "StartNumber",
        ["firstName"] = "Seller.FirstName",
        ["lastName"] = "Seller.LastName",
        ["postalCode"] = "Seller.PostalCode",
        ["city"] = "Seller.City",
        ["sellerType.name"] = "Type.Name",
        ["commissionRate"] = "Type.CommissionRate",
        ["itemFee"] = "Type.ItemFee",
        ["articleCount"] = "ArticleCount"
    };

    public async Task<(IReadOnlyList<SellerListItem>, int)> ExecuteAsync(
        string? search, int page, int pageSize, IReadOnlyList<SellerSort> sort, CancellationToken cancellationToken)
    {
        var query =
            from seller in dbContext.Sellers
            join type in dbContext.SellerTypes on seller.SellerTypeId equals type.Id
            select new SellerSortRow
            {
                Seller = seller,
                Type = type,
                StartNumber = dbContext.NumberBlocks.Where(b => b.SellerId == seller.Id).Min(b => (int?)b.FromNumber),
                ArticleCount = dbContext.Articles.Count(a => a.SellerId == seller.Id)
            };

        if (!string.IsNullOrWhiteSpace(search))
        {
            var pattern = $"%{search}%";
            query = query.Where(x =>
                EF.Functions.ILike(x.Seller.FirstName, pattern) ||
                EF.Functions.ILike(x.Seller.LastName, pattern) ||
                EF.Functions.ILike(x.Seller.City, pattern) ||
                EF.Functions.ILike(x.Seller.Email, pattern));
        }

        var totalCount = await query.CountAsync(cancellationToken);

        var orderBy = sort.Count == 0
            ? "Seller.LastName asc"
            : string.Join(", ", sort.Select(s => $"{SortFieldMap[s.Field]} {(s.Descending ? "descending" : "ascending")}"));

        var page1 = await query
            .OrderBy(orderBy)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);

        var items = page1.Select(x => new SellerListItem(
            x.Seller.Id, x.StartNumber, x.Seller.FirstName, x.Seller.LastName, x.Seller.Address,
            x.Seller.PostalCode, x.Seller.City, x.Seller.Phone, x.Seller.Email, x.Seller.SellerTypeId,
            x.Type.Name, x.Type.CommissionRate, x.Type.ItemFee, x.Seller.IsAdmin,
            x.ArticleCount,
            x.Seller.InviteToken != null && x.Seller.InviteTokenExpiresAt > DateTime.UtcNow
        )).ToList();

        return (items, totalCount);
    }

    private sealed class SellerSortRow
    {
        public required BAR.Domain.Sellers.Seller Seller { get; init; }
        public required BAR.Domain.SellerTypes.SellerType Type { get; init; }
        public int? StartNumber { get; init; }
        public int ArticleCount { get; init; }
    }
}
