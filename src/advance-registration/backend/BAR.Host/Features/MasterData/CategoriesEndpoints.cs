using System.Security.Claims;
using BAR.Application.MasterData.Categories.Create;
using BAR.Application.MasterData.Categories.Delete;
using BAR.Application.MasterData.Categories.GetAll;
using BAR.Application.MasterData.Categories.Update;
using BAR.Host.Validation;

namespace BAR.Host.Features.MasterData;

/// <summary>
/// Kategorie-Stammdaten: identisches Verhalten wie <see cref="BrandsEndpoints"/> --
/// siehe dort fuer die Begruendung, warum Command-Bodies direkt gebunden werden
/// (statt separater Request-DTOs) und IsAdmin/Id per <c>with</c>-Ausdruck aus
/// Claim bzw. Route ueberschrieben werden.
/// </summary>
public static class CategoriesEndpoints
{
    public static IEndpointRouteBuilder MapCategoriesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", async (ClaimsPrincipal user, GetAllCategoriesQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(user.IsInRole("admin"), ct))
        ).RequireAuthorization();

        app.MapPost("/api/categories", async (
            ClaimsPrincipal user, CreateCategoryCommand command, CreateCategoryCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command with { IsAdmin = user.IsInRole("admin") }, ct);
            return Results.Created($"/api/categories/{result.Id}", result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<CreateCategoryCommand>>();

        app.MapPut("/api/categories/{id}", async (
            string id, UpdateCategoryCommand command, UpdateCategoryCommandHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(command with { Id = id }, ct))
        ).RequireAuthorization("admin").AddEndpointFilter<ValidationFilter<UpdateCategoryCommand>>();

        app.MapDelete("/api/categories/{id}", async (string id, DeleteCategoryCommandHandler handler, CancellationToken ct) =>
        {
            await handler.HandleAsync(id, ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
