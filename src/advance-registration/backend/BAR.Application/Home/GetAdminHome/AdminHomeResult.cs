namespace BAR.Application.Home.GetAdminHome;

public sealed record HeatmapEntryResult(DateOnly Date, int Count);

public sealed record AdminHomeResult(
    int SellerCount,
    int ArticleCount,
    int CategoryCount,
    int BrandCount,
    IReadOnlyList<HeatmapEntryResult> HeatmapData);
