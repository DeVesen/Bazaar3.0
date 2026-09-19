namespace Bazaar.Domain.Ports;

/// <summary>
/// Read-model port for GET /api/statistics (api/statistics.md, Round-22). One
/// call backs the entire Statistik-Seite — no per-Kennzahl endpoints. Returns
/// ONLY raw/aggregated values read from the Article/Seller records; sellRate
/// and earningsTotal are pure derivations of already-loaded numbers with no DB
/// access involved, so they are computed by GetStatisticsHandler, not here
/// (mirrors ISellerSettlementQuery excluding Commission/Payout/CanSettle).
/// `sellerTypeId` filters ONLY <see cref="StatisticsReadModel.Leaderboard"/> —
/// every KPI/finance number here is computed over all sellers/articles
/// regardless of the filter (api/statistics.md: "filtert nur das
/// Leaderboard... die KPI-Zeilen bleiben unverändert").
/// </summary>
public interface IStatisticsQuery
{
    Task<StatisticsReadModel> Get(string? sellerTypeId);
}

public sealed record StatisticsReadModel(
    int TotalCount,
    int AcceptedCount,
    int SellingCount,
    int SoldCount,
    int ReturnedCount,
    decimal AcceptedValue,
    decimal ReturnedValue,
    decimal OpenValue,
    decimal GrossIncome,
    decimal GrossIncomeManual,
    decimal Commission,
    decimal Fees,
    decimal PayoutExpected,
    decimal PayoutSettled,
    IReadOnlyList<LeaderboardRowReadModel> Leaderboard);

public sealed record LeaderboardRowReadModel(
    string SellerId,
    string SellerName,
    string SellerType,
    int Accepted,
    int Sold,
    decimal Revenue,
    decimal Payout,
    bool Settled);
