using BAR.Modules.Registration.Contracts;
using BAR.Modules.Operations.Contracts;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.SellerManagement.Contracts;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Host.Features.Home;

public sealed record HeatmapEntryResponse(DateOnly Date, int Count);
public sealed record AdminHomeResponse(int SellerCount, int ArticleCount, int CategoryCount, int BrandCount, IReadOnlyList<HeatmapEntryResponse> HeatmapData);
public sealed record TypeConditionsResponse(decimal CommissionRate, decimal ItemFee);
public sealed record SellerHomeResponse(int ArticleCount, TypeConditionsResponse TypeConditions);

/// <summary>
/// A pure view composition with no record of its own (modulith-thinking:
/// "Home" belongs to no department) - it therefore lives in the Host, not in
/// a module, and calls only the contracts of the three modules involved.
/// </summary>
public sealed class HomeCompositionService(
    ISellerManagementModuleApi sellerManagement,
    IRegistrationModuleApi registration,
    IMasterDataModuleApi masterData,
    IClock clock)
{
    private const int HeatmapWeeks = 12;

    public async Task<AdminHomeResponse> GetAdminHomeAsync(CancellationToken cancellationToken)
    {
        var since = clock.UtcNow.Date.AddDays(-(HeatmapWeeks * 7));

        var sellerCount = await sellerManagement.GetSellerCountAsync(cancellationToken);
        var stats = await registration.GetDashboardStatsAsync(since, cancellationToken);
        var brandNames = await masterData.GetAllBrandNamesAsync(cancellationToken);
        var categoryNames = await masterData.GetAllCategoryNamesAsync(cancellationToken);

        return new AdminHomeResponse(
            sellerCount, stats.ArticleCount, categoryNames.Count, brandNames.Count,
            stats.HeatmapData.Select(d => new HeatmapEntryResponse(d.Date, d.Count)).ToList());
    }

    public async Task<SellerHomeResponse> GetSellerHomeAsync(string sellerId, CancellationToken cancellationToken)
    {
        var conditions = await sellerManagement.GetSellerConditionsAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");
        var articleCount = await registration.CountArticlesForSellerAsync(sellerId, cancellationToken);

        return new SellerHomeResponse(articleCount, new TypeConditionsResponse(conditions.CommissionRate, conditions.ItemFee));
    }
}
