using Bazaar.Domain.Ports;

namespace Bazaar.Application.Statistics;

public sealed class GetStatisticsHandler(IStatisticsQuery statisticsQuery)
{
    public async Task<StatisticsResult> Handle(string? sellerTypeId)
    {
        var readModel = await statisticsQuery.Get(sellerTypeId);

        decimal? sellRate = readModel.AcceptedCount == 0
            ? null
            : Math.Round((decimal)readModel.SoldCount / readModel.AcceptedCount * 100, 2, MidpointRounding.AwayFromZero);

        var earningsTotal = readModel.Commission + readModel.Fees;

        return new StatisticsResult(
            readModel.TotalCount,
            readModel.AcceptedCount,
            readModel.SellingCount,
            readModel.SoldCount,
            readModel.ReturnedCount,
            sellRate,
            readModel.AcceptedValue,
            readModel.ReturnedValue,
            readModel.OpenValue,
            readModel.GrossIncome,
            readModel.GrossIncomeManual,
            readModel.Commission,
            readModel.Fees,
            earningsTotal,
            readModel.PayoutExpected,
            readModel.PayoutSettled,
            readModel.Leaderboard);
    }
}

public sealed record StatisticsResult(
    int TotalCount,
    int AcceptedCount,
    int SellingCount,
    int SoldCount,
    int ReturnedCount,
    decimal? SellRate,
    decimal AcceptedValue,
    decimal ReturnedValue,
    decimal OpenValue,
    decimal GrossIncome,
    decimal GrossIncomeManual,
    decimal Commission,
    decimal Fees,
    decimal EarningsTotal,
    decimal PayoutExpected,
    decimal PayoutSettled,
    IReadOnlyList<LeaderboardRowReadModel> Leaderboard);
