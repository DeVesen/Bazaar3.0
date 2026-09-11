using System.Security.Claims;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Host.Validation;

namespace BAR.Host.Features.MasterData;

/// <summary>Kategorie-Stammdaten: identisches Verhalten wie <see cref="BrandsEndpoints"/>.</summary>
public static class CategoriesEndpoints
{
    public static IEndpointRouteBuilder MapCategoriesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", async (ClaimsPrincipal user, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
            Results.Ok(await stammdaten.GetAllCategoriesAsync(user.IsInRole("admin"), ct))
        ).RequireAuthorization();

        app.MapPost("/api/categories", async (
            ClaimsPrincipal user, CreateCategoryCommand command, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
        {
            var result = await stammdaten.CreateCategoryAsync(command with { IsAdmin = user.IsInRole("admin") }, ct);
            return Results.Created($"/api/categories/{result.Id}", result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<CreateCategoryCommand>>();

        app.MapPut("/api/categories/{id}", async (
            string id, UpdateCategoryCommand command, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
            Results.Ok(await stammdaten.UpdateCategoryAsync(id, command, ct))
        ).RequireAuthorization("admin").AddEndpointFilter<ValidationFilter<UpdateCategoryCommand>>();

        app.MapDelete("/api/categories/{id}", async (string id, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
        {
            await stammdaten.DeleteCategoryAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
