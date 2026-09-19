using Bazaar.Application.Statistics;

namespace Bazaar.Api.Features.Statistics;

public static class StatisticsEndpoints
{
    public static IEndpointRouteBuilder MapStatisticsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/statistics", async (string? sellerTypeId, GetStatisticsHandler handler) =>
        {
            var result = await handler.Handle(sellerTypeId);
            var dto = new StatisticsDto(
                new ArticlesDto(result.TotalCount, result.AcceptedCount, result.SellingCount, result.SoldCount, result.ReturnedCount, result.SellRate),
                new ValuesDto(result.AcceptedValue, result.ReturnedValue, result.OpenValue),
                new FinanceDto(result.GrossIncome, result.GrossIncomeManual, result.Commission, result.Fees, result.EarningsTotal, result.PayoutExpected, result.PayoutSettled),
                result.Leaderboard.Select((row, index) => new LeaderboardRowDto(
                    index + 1, row.SellerId, row.SellerName, row.SellerType, row.Accepted, row.Sold, row.Revenue, row.Payout, row.Settled)).ToArray());
            return Results.Ok(dto);
        })
        .RequireAuthorization();

        return app;
    }
}

public sealed record StatisticsDto(ArticlesDto Articles, ValuesDto Values, FinanceDto Finance, LeaderboardRowDto[] Leaderboard);
public sealed record ArticlesDto(int Total, int Accepted, int Selling, int Sold, int Returned, decimal? SellRate);
public sealed record ValuesDto(decimal AcceptedValue, decimal ReturnedValue, decimal OpenValue);
public sealed record FinanceDto(decimal GrossIncome, decimal GrossIncomeManual, decimal Commission, decimal Fees, decimal EarningsTotal, decimal PayoutExpected, decimal PayoutSettled);
public sealed record LeaderboardRowDto(int Rank, string SellerId, string SellerName, string SellerType, int Accepted, int Sold, decimal Revenue, decimal Payout, bool Settled);
