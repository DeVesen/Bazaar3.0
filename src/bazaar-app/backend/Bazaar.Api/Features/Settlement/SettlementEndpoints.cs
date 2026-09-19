using Bazaar.Application.Settlement;

namespace Bazaar.Api.Features.Settlement;

public static class SettlementEndpoints
{
    public static IEndpointRouteBuilder MapSettlementEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/sellers/{id}/settlement", async (string id, GetSellerSettlementHandler handler) =>
        {
            var result = await handler.Handle(id);
            var dto = new SellerSettlementDto(
                new SellerSettlementSellerDto(result.SellerId, result.FirstName, result.LastName, result.Address, result.PostalCode, result.City),
                result.OpenCount,
                result.SoldCount,
                result.ReturnedCount,
                result.Revenue,
                result.CommissionRate,
                result.Commission,
                result.Payout,
                result.IntakeFeePaid,
                result.NotDeliveredCount,
                result.SettledAt,
                result.PayoutAmount,
                result.CanSettle);
            return Results.Ok(dto);
        })
        .RequireAuthorization();

        app.MapPut("/api/articles/{id}/return", async (string id, ReturnArticleHandler handler) =>
        {
            await handler.Handle(id, DateTimeOffset.UtcNow);
            return Results.NoContent();
        })
        .RequireAuthorization();

        return app;
    }
}

public sealed record SellerSettlementSellerDto(
    string Id,
    string FirstName,
    string LastName,
    string? Address,
    string? PostalCode,
    string? City);

public sealed record SellerSettlementDto(
    SellerSettlementSellerDto Seller,
    int OpenCount,
    int SoldCount,
    int ReturnedCount,
    decimal Revenue,
    decimal CommissionRate,
    decimal Commission,
    decimal Payout,
    decimal IntakeFeePaid,
    int NotDeliveredCount,
    DateTimeOffset? SettledAt,
    decimal? PayoutAmount,
    bool CanSettle);
