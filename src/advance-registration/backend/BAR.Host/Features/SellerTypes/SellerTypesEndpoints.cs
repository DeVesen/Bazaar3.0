using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Host.Validation;

namespace BAR.Host.Features.SellerTypes;

public static class SellerTypesEndpoints
{
    public static IEndpointRouteBuilder MapSellerTypesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/seller-types", async (IMasterDataModuleApi masterData, CancellationToken ct) =>
            Results.Ok(await masterData.GetAllSellerTypesAsync(ct))
        ).RequireAuthorization("admin");

        app.MapPost("/api/seller-types", async (CreateSellerTypeCommand command, IMasterDataModuleApi masterData, CancellationToken ct) =>
        {
            var result = await masterData.CreateSellerTypeAsync(command, ct);
            return Results.Created($"/api/seller-types/{result.Id}", result);
        }).AddEndpointFilter<ValidationFilter<CreateSellerTypeCommand>>().RequireAuthorization("admin");

        app.MapPut("/api/seller-types/{id}", async (string id, UpdateSellerTypeCommand command, IMasterDataModuleApi masterData, CancellationToken ct) =>
            Results.Ok(await masterData.UpdateSellerTypeAsync(id, command, ct))
        ).AddEndpointFilter<ValidationFilter<UpdateSellerTypeCommand>>().RequireAuthorization("admin");

        app.MapDelete("/api/seller-types/{id}", async (string id, IMasterDataModuleApi masterData, CancellationToken ct) =>
        {
            await masterData.DeleteSellerTypeAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
