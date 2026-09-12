using System.Security.Claims;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Host.Validation;

namespace BAR.Host.Features.MasterData;

/// <summary>Kategorie-MasterData: identisches Verhalten wie <see cref="BrandsEndpoints"/>.</summary>
public static class CategoriesEndpoints
{
    public static IEndpointRouteBuilder MapCategoriesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", async (ClaimsPrincipal user, IMasterDataModuleApi masterData, CancellationToken ct) =>
            Results.Ok(await masterData.GetAllCategoriesAsync(user.IsInRole("admin"), ct))
        ).RequireAuthorization();

        app.MapPost("/api/categories", async (
            ClaimsPrincipal user, CreateCategoryCommand command, IMasterDataModuleApi masterData, CancellationToken ct) =>
        {
            var result = await masterData.CreateCategoryAsync(command with { IsAdmin = user.IsInRole("admin") }, ct);
            return Results.Created($"/api/categories/{result.Id}", result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<CreateCategoryCommand>>();

        app.MapPut("/api/categories/{id}", async (
            string id, UpdateCategoryCommand command, IMasterDataModuleApi masterData, CancellationToken ct) =>
            Results.Ok(await masterData.UpdateCategoryAsync(id, command, ct))
        ).RequireAuthorization("admin").AddEndpointFilter<ValidationFilter<UpdateCategoryCommand>>();

        app.MapDelete("/api/categories/{id}", async (string id, IMasterDataModuleApi masterData, CancellationToken ct) =>
        {
            await masterData.DeleteCategoryAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
