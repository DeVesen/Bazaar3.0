namespace BAR.Domain.Ports.Queries;

public sealed record SellerHomeData(int ArticleCount, decimal CommissionRate, decimal ItemFee);

public sealed record HeatmapDay(DateOnly Date, int Count);

public sealed record AdminHomeData(
    int SellerCount,
    int ArticleCount,
    int CategoryCount,
    int BrandCount,
    IReadOnlyList<HeatmapDay> HeatmapData);

public interface IHomeQueries
{
    Task<SellerHomeData?> GetSellerHomeAsync(string sellerId, CancellationToken cancellationToken);

    Task<AdminHomeData> GetAdminHomeAsync(DateTime heatmapSince, CancellationToken cancellationToken);
}
