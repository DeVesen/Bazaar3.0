using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Sellers;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;

namespace BAR.Modules.SellerManagement.Application.Sellers.List;

/// <summary>
/// Replaces the former SQL join against Seller/SellerType/NumberBlock/Article
/// (a dynamic LINQ sort over a shared projection): since the modulith cut,
/// the four aggregates live in three different schemas. At a realistic
/// bazaar size (dozens to a few hundred sellers), "load all, enrich via
/// Contracts, sort/paginate in memory" is the CRUD-appropriate solution
/// (architecture-styles: no over-engineering on a hunch) - batch enrichment
/// per module instead of one call per seller.
/// </summary>
public sealed class GetSellersQueryHandler(ISellerRepository sellers, IMasterDataModuleApi masterData, IRegistrationModuleApi registration)
{
    private sealed record SellerRow(Seller Seller, SellerTypeConditionsDto Conditions, int? StartNumber, int ArticleCount);

    public async Task<PagedResultDto<SellerDto>> HandleAsync(GetSellersQuery request, CancellationToken cancellationToken)
    {
        var all = await sellers.GetAllAsync(cancellationToken);

        IEnumerable<Seller> filtered = all;
        if (!string.IsNullOrWhiteSpace(request.SellerTypeId))
        {
            filtered = filtered.Where(s => s.SellerTypeId == request.SellerTypeId);
        }
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            var term = request.Search.Trim();
            filtered = filtered.Where(s =>
                s.FirstName.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                s.LastName.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                s.City.Contains(term, StringComparison.OrdinalIgnoreCase) ||
                s.Email.Contains(term, StringComparison.OrdinalIgnoreCase));
        }

        var sellerList = filtered.ToList();

        var conditionsByType = new Dictionary<string, SellerTypeConditionsDto>();
        foreach (var typeId in sellerList.Select(s => s.SellerTypeId).Distinct())
        {
            var conditions = await masterData.GetSellerTypeConditionsAsync(typeId, cancellationToken);
            if (conditions is not null) conditionsByType[typeId] = conditions;
        }

        var blockSummaries = await registration.GetBlockSummariesForSellersAsync(
            sellerList.Select(s => s.Id).ToList(), cancellationToken);

        var rows = sellerList
            .Where(s => conditionsByType.ContainsKey(s.SellerTypeId))
            .Select(s =>
            {
                var summary = blockSummaries.GetValueOrDefault(s.Id, new SellerBlockSummaryDto(null, 0));
                return new SellerRow(s, conditionsByType[s.SellerTypeId], summary.StartNumber, summary.ArticleCount);
            })
            .ToList();

        var sorted = ApplySort(rows, request.Sort);
        var totalCount = sorted.Count;

        var page = sorted
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(r => new SellerDto(
                r.Seller.Id, r.StartNumber, r.Seller.FirstName, r.Seller.LastName, r.Seller.Address,
                r.Seller.PostalCode, r.Seller.City, r.Seller.Phone, r.Seller.Email, r.Seller.SellerTypeId,
                new SellerTypeSummaryDto(r.Conditions.SellerTypeId, r.Conditions.Name, r.Conditions.CommissionRate, r.Conditions.ItemFee),
                r.Seller.IsAdmin, r.ArticleCount,
                r.Seller.InviteToken != null && r.Seller.InviteTokenExpiresAt > DateTime.UtcNow))
            .ToList();

        return new PagedResultDto<SellerDto>(page, totalCount, request.Page, request.PageSize);
    }

    private static List<SellerRow> ApplySort(List<SellerRow> rows, IReadOnlyList<SellerSortDto> sort)
    {
        if (sort.Count == 0)
        {
            return rows.OrderBy(r => r.Seller.LastName, StringComparer.OrdinalIgnoreCase).ToList();
        }

        IOrderedEnumerable<SellerRow>? ordered = null;
        foreach (var s in sort)
        {
            Func<SellerRow, IComparable> selector = s.Field switch
            {
                "startNumber" => r => r.StartNumber ?? int.MinValue,
                "firstName" => r => r.Seller.FirstName,
                "lastName" => r => r.Seller.LastName,
                "postalCode" => r => r.Seller.PostalCode,
                "city" => r => r.Seller.City,
                "sellerType.name" => r => r.Conditions.Name,
                "commissionRate" => r => r.Conditions.CommissionRate,
                "itemFee" => r => r.Conditions.ItemFee,
                "articleCount" => r => r.ArticleCount,
                _ => r => r.Seller.LastName
            };

            ordered = ordered is null
                ? (s.Descending ? rows.OrderByDescending(selector) : rows.OrderBy(selector))
                : (s.Descending ? ordered.ThenByDescending(selector) : ordered.ThenBy(selector));
        }

        return ordered!.ToList();
    }
}
