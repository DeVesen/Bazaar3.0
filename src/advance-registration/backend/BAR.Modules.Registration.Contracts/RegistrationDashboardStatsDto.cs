namespace BAR.Modules.Registration.Contracts;

public sealed record HeatmapEntryDto(DateOnly Date, int Count);

/// <summary>For Home (Host composition, admin view).</summary>
public sealed record RegistrationDashboardStatsDto(int ArticleCount, IReadOnlyList<HeatmapEntryDto> HeatmapData);

/// <summary>For the seller list (SellerManagement).</summary>
public sealed record SellerBlockSummaryDto(int? StartNumber, int ArticleCount);
