using Bazaar.Api.Filters;
using Bazaar.Application.Sales;

namespace Bazaar.Api.Features.Sales;

public static class SalesEndpoints
{
    public static IEndpointRouteBuilder MapSalesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/sales", async (RecordSaleCommand command, RecordSaleHandler handler) =>
        {
            var result = await handler.Handle(command);
            return Results.Ok(new SalesResponseDto(result.SoldCount, result.Total, result.SoldAt));
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<RecordSaleCommand>>();

        app.MapPost("/api/sales/undo", async (UndoSaleCommand command, UndoSaleHandler handler) =>
        {
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<UndoSaleCommand>>();

        return app;
    }
}

public sealed record SalesResponseDto(int SoldCount, decimal Total, DateTimeOffset SoldAt);
