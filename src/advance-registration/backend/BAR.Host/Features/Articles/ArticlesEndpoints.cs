using System.Security.Claims;
using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Anmeldung.Contracts.Articles;
using BAR.Host.Validation;

namespace BAR.Host.Features.Articles;

/// <summary>
/// Artikel-Erfassung fuer Verkaeufer (eigene Artikel) und Verwaltung fuer
/// Admins (alle Artikel). SellerId (und bei Update die Id) kommen
/// ausschliesslich aus Claim bzw. Route und ueberschreiben per
/// <c>with</c>-Ausdruck, was der Client im Body mitschickt.
/// </summary>
public static class ArticlesEndpoints
{
    public static IEndpointRouteBuilder MapArticlesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/articles/mine", async (
            ClaimsPrincipal user, string? brand, string? category, string? search,
            int? page, int? pageSize, string? sort, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var effectivePage = Math.Max(1, page ?? 1);
            var effectivePageSize = Math.Clamp(pageSize ?? 25, 1, 100);
            var result = await anmeldung.GetMyArticlesAsync(
                new GetMyArticlesQuery(sellerId, brand, category, search, effectivePage, effectivePageSize, sort), ct);
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapGet("/api/articles/next-number", async (ClaimsPrincipal user, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await anmeldung.GetNextNumberAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapPost("/api/articles", async (
            ClaimsPrincipal user, CreateArticleCommand command, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await anmeldung.CreateArticleAsync(command with { SellerId = sellerId }, ct);
            return Results.Created($"/api/articles/{result.Id}", result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<CreateArticleCommand>>();

        app.MapPut("/api/articles/{id}", async (
            ClaimsPrincipal user, string id, UpdateArticleCommand command, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await anmeldung.UpdateArticleAsync(command with { Id = id, SellerId = sellerId }, ct);
            return Results.Ok(result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<UpdateArticleCommand>>();

        app.MapDelete("/api/articles/{id}", async (ClaimsPrincipal user, string id, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await anmeldung.DeleteArticleAsync(new DeleteArticleCommand(id, sellerId), ct);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapGet("/api/articles", async (
            string? brand, string? category, string? search, string? sellerId,
            int? page, int? pageSize, string? sort, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            var effectivePage = Math.Max(1, page ?? 1);
            var effectivePageSize = Math.Clamp(pageSize ?? 25, 1, 100);
            var query = new GetAllArticlesQuery(brand, category, search, sellerId, effectivePage, effectivePageSize, sort);
            return Results.Ok(await anmeldung.GetAllArticlesAsync(query, ct));
        }).RequireAuthorization("admin");

        app.MapGet("/api/articles/{id}", async (string id, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
            Results.Ok(await anmeldung.GetArticleByIdAsync(id, ct))
        ).RequireAuthorization("admin");

        return app;
    }
}
