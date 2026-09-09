using System.Security.Claims;
using BAR.Application.MasterData.Brands.Create;
using BAR.Application.MasterData.Brands.Delete;
using BAR.Application.MasterData.Brands.GetAll;
using BAR.Application.MasterData.Brands.Update;
using BAR.Host.Validation;

namespace BAR.Host.Features.MasterData;

/// <summary>
/// Marken-Stammdaten: Lesen fuer alle authentifizierten Nutzer (Artikelcount nur
/// fuer Admins), Anlegen fuer alle authentifizierten Nutzer (Verkaeufer legen
/// Marken "im Vorbeigehen" beim Erfassen eines Artikels an), Aendern/Loeschen nur
/// fuer Admins. Die Command-Bodies (<see cref="CreateBrandCommand"/>,
/// <see cref="UpdateBrandCommand"/>) werden direkt als Request-Body gebunden --
/// wie in ArticlesEndpoints/ProfileEndpoints -- damit die dort registrierten
/// FluentValidation-Validatoren ueber <c>ValidationFilter&lt;TCommand&gt;</c>
/// tatsaechlich greifen (ein separates Request-DTO wuerde die Filter-Typprüfung
/// per <c>context.Arguments.OfType&lt;TRequest&gt;()</c> stillschweigend verfehlen).
/// IsAdmin (Create) und Id (Update) kommen ausschliesslich aus Claim bzw. Route
/// und ueberschreiben per <c>with</c>-Ausdruck, was der Client im Body mitschickt.
/// </summary>
public static class BrandsEndpoints
{
    public static IEndpointRouteBuilder MapBrandsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/brands", async (ClaimsPrincipal user, GetAllBrandsQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(user.IsInRole("admin"), ct))
        ).RequireAuthorization();

        app.MapPost("/api/brands", async (
            ClaimsPrincipal user, CreateBrandCommand command, CreateBrandCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command with { IsAdmin = user.IsInRole("admin") }, ct);
            return Results.Created($"/api/brands/{result.Id}", result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<CreateBrandCommand>>();

        app.MapPut("/api/brands/{id}", async (
            string id, UpdateBrandCommand command, UpdateBrandCommandHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(command with { Id = id }, ct))
        ).RequireAuthorization("admin").AddEndpointFilter<ValidationFilter<UpdateBrandCommand>>();

        app.MapDelete("/api/brands/{id}", async (string id, DeleteBrandCommandHandler handler, CancellationToken ct) =>
        {
            await handler.HandleAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
