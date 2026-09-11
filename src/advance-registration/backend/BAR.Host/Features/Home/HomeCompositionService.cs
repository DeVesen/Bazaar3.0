using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Host.Features.Home;

public sealed record HeatmapEntryResponse(DateOnly Date, int Count);
public sealed record AdminHomeResponse(int SellerCount, int ArticleCount, int CategoryCount, int BrandCount, IReadOnlyList<HeatmapEntryResponse> HeatmapData);
public sealed record TypeConditionsResponse(decimal CommissionRate, decimal ItemFee);
public sealed record SellerHomeResponse(int ArticleCount, TypeConditionsResponse TypeConditions);

/// <summary>
/// Reine Sichtkomposition ohne eigene Akte (modulith-thinking: "Home" gehoert
/// zu keiner Abteilung) - liegt darum im Host, nicht in einem Modul, und ruft
/// ausschliesslich Contracts der drei betroffenen Module auf.
/// </summary>
public sealed class HomeCompositionService(
    IVerkaeuferverwaltungModuleApi verkaeuferverwaltung,
    IAnmeldungModuleApi anmeldung,
    IStammdatenModuleApi stammdaten,
    IClock clock)
{
    private const int HeatmapWeeks = 12;

    public async Task<AdminHomeResponse> GetAdminHomeAsync(CancellationToken cancellationToken)
    {
        var since = clock.UtcNow.Date.AddDays(-(HeatmapWeeks * 7));

        var sellerCount = await verkaeuferverwaltung.GetSellerCountAsync(cancellationToken);
        var stats = await anmeldung.GetDashboardStatsAsync(since, cancellationToken);
        var brandNames = await stammdaten.GetAllBrandNamesAsync(cancellationToken);
        var categoryNames = await stammdaten.GetAllCategoryNamesAsync(cancellationToken);

        return new AdminHomeResponse(
            sellerCount, stats.ArticleCount, categoryNames.Count, brandNames.Count,
            stats.HeatmapData.Select(d => new HeatmapEntryResponse(d.Date, d.Count)).ToList());
    }

    public async Task<SellerHomeResponse> GetSellerHomeAsync(string sellerId, CancellationToken cancellationToken)
    {
        var conditions = await verkaeuferverwaltung.GetSellerConditionsAsync(sellerId, cancellationToken)
            ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");
        var articleCount = await anmeldung.CountArticlesForSellerAsync(sellerId, cancellationToken);

        return new SellerHomeResponse(articleCount, new TypeConditionsResponse(conditions.CommissionRate, conditions.ItemFee));
    }
}
