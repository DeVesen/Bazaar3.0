using System.Security.Claims;
using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Stammdaten.Contracts.MasterData;
using BAR.Host.Validation;

namespace BAR.Host.Features.MasterData;

/// <summary>
/// Marken-Stammdaten: Lesen fuer alle authentifizierten Nutzer (Artikelcount nur
/// fuer Admins), Anlegen fuer alle authentifizierten Nutzer (Verkaeufer legen
/// Marken "im Vorbeigehen" beim Erfassen eines Artikels an), Aendern/Loeschen nur
/// fuer Admins.
/// </summary>
public static class BrandsEndpoints
{
    public static IEndpointRouteBuilder MapBrandsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/brands", async (ClaimsPrincipal user, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
            Results.Ok(await stammdaten.GetAllBrandsAsync(user.IsInRole("admin"), ct))
        ).RequireAuthorization();

        app.MapPost("/api/brands", async (
            ClaimsPrincipal user, CreateBrandCommand command, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
        {
            var result = await stammdaten.CreateBrandAsync(command with { IsAdmin = user.IsInRole("admin") }, ct);
            return Results.Created($"/api/brands/{result.Id}", result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<CreateBrandCommand>>();

        app.MapPut("/api/brands/{id}", async (
            string id, UpdateBrandCommand command, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
            Results.Ok(await stammdaten.UpdateBrandAsync(id, command, ct))
        ).RequireAuthorization("admin").AddEndpointFilter<ValidationFilter<UpdateBrandCommand>>();

        app.MapDelete("/api/brands/{id}", async (string id, IStammdatenModuleApi stammdaten, CancellationToken ct) =>
        {
            await stammdaten.DeleteBrandAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
