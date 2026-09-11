using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Stammdaten.Contracts.SellerTypes;
using BAR.Host.Validation;

namespace BAR.Host.Features.SellerTypes;

public static class SellerTypesEndpoints
{
    public static IEndpointRouteBuilder MapSellerTypesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/seller-types", async (IStammdatenModuleApi stammdaten, CancellationToken ct) =>
            Results.Ok(await stammdaten.GetAllSellerTypesAsync(ct))
        ).RequireAuthorization("admin");

        app.MapPost("/api/seller-types", async (CreateSellerTypeCommand command, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
        {
            var result = await stammdaten.CreateSellerTypeAsync(command, ct);
            return Results.Created($"/api/seller-types/{result.Id}", result);
        }).AddEndpointFilter<ValidationFilter<CreateSellerTypeCommand>>().RequireAuthorization("admin");

        app.MapPut("/api/seller-types/{id}", async (string id, UpdateSellerTypeCommand command, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
            Results.Ok(await stammdaten.UpdateSellerTypeAsync(id, command, ct))
        ).AddEndpointFilter<ValidationFilter<UpdateSellerTypeCommand>>().RequireAuthorization("admin");

        app.MapDelete("/api/seller-types/{id}", async (string id, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
        {
            await stammdaten.DeleteSellerTypeAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
