using BAR.Application.Abstractions;
using BAR.Domain.Ports.Queries;

namespace BAR.Application.Home.GetAdminHome;

public sealed class GetAdminHomeQueryHandler(IHomeQueries homeQueries, IClock clock)
{
    private const int HeatmapWeeks = 12;

    public async Task<AdminHomeResult> HandleAsync(CancellationToken cancellationToken)
    {
        var since = clock.UtcNow.Date.AddDays(-(HeatmapWeeks * 7));
        var data = await homeQueries.GetAdminHomeAsync(since, cancellationToken);

        return new AdminHomeResult(
            data.SellerCount,
            data.ArticleCount,
            data.CategoryCount,
            data.BrandCount,
            data.HeatmapData.Select(d => new HeatmapEntryResult(d.Date, d.Count)).ToList());
    }
}
