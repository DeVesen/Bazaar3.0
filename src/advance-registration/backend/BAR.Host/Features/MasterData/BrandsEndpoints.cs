using System.Security.Claims;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.MasterData;
using BAR.Host.Validation;

namespace BAR.Host.Features.MasterData;

/// <summary>
/// Brand master data: reading is open to all authenticated users (the article
/// count only for admins), creating is open to all authenticated users
/// (sellers create brands "on the fly" while capturing an article),
/// updating/deleting is admin-only.
/// </summary>
public static class BrandsEndpoints
{
    public static IEndpointRouteBuilder MapBrandsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/brands", async (ClaimsPrincipal user, IMasterDataModuleApi masterData, CancellationToken ct) =>
            Results.Ok(await masterData.GetAllBrandsAsync(user.IsInRole("admin"), ct))
        ).RequireAuthorization();

        app.MapPost("/api/brands", async (
            ClaimsPrincipal user, CreateBrandCommand command, IMasterDataModuleApi masterData, CancellationToken ct) =>
        {
            var result = await masterData.CreateBrandAsync(command with { IsAdmin = user.IsInRole("admin") }, ct);
            return Results.Created($"/api/brands/{result.Id}", result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<CreateBrandCommand>>();

        app.MapPut("/api/brands/{id}", async (
            string id, UpdateBrandCommand command, IMasterDataModuleApi masterData, CancellationToken ct) =>
            Results.Ok(await masterData.UpdateBrandAsync(id, command, ct))
        ).RequireAuthorization("admin").AddEndpointFilter<ValidationFilter<UpdateBrandCommand>>();

        app.MapDelete("/api/brands/{id}", async (string id, IMasterDataModuleApi masterData, CancellationToken ct) =>
        {
            await masterData.DeleteBrandAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
