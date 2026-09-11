namespace BAR.Modules.Anmeldung.Contracts;

public sealed record HeatmapEntryDto(DateOnly Date, int Count);

/// <summary>Fuer Home (Host-Komposition, Admin-Ansicht).</summary>
public sealed record AnmeldungDashboardStatsDto(int ArticleCount, IReadOnlyList<HeatmapEntryDto> HeatmapData);

/// <summary>Fuer die Verkaeufer-Liste (Verkaeuferverwaltung).</summary>
public sealed record SellerBlockSummaryDto(int? StartNumber, int ArticleCount);
