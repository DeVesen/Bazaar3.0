using Bazaar.Api.Filters;
using Bazaar.Application.SellerTypes;

namespace Bazaar.Api.Features.SellerTypes;

public static class SellerTypeEndpoints
{
    public static IEndpointRouteBuilder MapSellerTypeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/seller-types", async (GetSellerTypesHandler handler) =>
        {
            var sellerTypes = await handler.Handle();
            return Results.Ok(sellerTypes.Select(s => new SellerTypeDto(s.Id, s.Name, s.CommissionRate, s.ItemFee, s.SellerCount)));
        })
        .RequireAuthorization();

        app.MapPost("/api/seller-types", async (CreateSellerTypeCommand command, CreateSellerTypeHandler handler) =>
        {
            var sellerType = await handler.Handle(command);
            var dto = new SellerTypeDto(sellerType.Id, sellerType.Name, sellerType.CommissionRate, sellerType.ItemFee, 0);
            return Results.Created($"/api/seller-types/{sellerType.Id}", dto);
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<CreateSellerTypeCommand>>();

        app.MapPut("/api/seller-types/{id}", async (string id, UpdateSellerTypeCommand command, UpdateSellerTypeHandler handler) =>
        {
            // Filter above validates `command` (Name/CommissionRate/ItemFee) before Id is set
            // from the route value — same precedent as CategoryEndpoints.cs.
            command.Id = id;
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<UpdateSellerTypeCommand>>();

        app.MapDelete("/api/seller-types/{id}", async (string id, DeleteSellerTypeHandler handler) =>
        {
            await handler.Handle(id);
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        return app;
    }
}
