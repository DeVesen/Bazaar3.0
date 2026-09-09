using BAR.Application.SellerTypes.Create;
using BAR.Application.SellerTypes.Delete;
using BAR.Application.SellerTypes.GetAll;
using BAR.Application.SellerTypes.Update;
using BAR.Host.Validation;

namespace BAR.Host.Features.SellerTypes;

public static class SellerTypesEndpoints
{
    public static IEndpointRouteBuilder MapSellerTypesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/seller-types", async (GetAllSellerTypesQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(ct))
        ).RequireAuthorization("admin");

        app.MapPost("/api/seller-types", async (CreateSellerTypeCommand command, CreateSellerTypeCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command, ct);
            return Results.Created($"/api/seller-types/{result.Id}", result);
        }).AddEndpointFilter<ValidationFilter<CreateSellerTypeCommand>>().RequireAuthorization("admin");

        app.MapPut("/api/seller-types/{id}", async (string id, UpdateSellerTypeCommand command, UpdateSellerTypeCommandHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(id, command, ct))
        ).AddEndpointFilter<ValidationFilter<UpdateSellerTypeCommand>>().RequireAuthorization("admin");

        app.MapDelete("/api/seller-types/{id}", async (string id, DeleteSellerTypeCommandHandler handler, CancellationToken ct) =>
        {
            await handler.HandleAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
