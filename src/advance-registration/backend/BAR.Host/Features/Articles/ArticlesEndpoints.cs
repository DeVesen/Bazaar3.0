using System.Security.Claims;
using BAR.Application.Articles.Create;
using BAR.Application.Articles.Delete;
using BAR.Application.Articles.GetAll;
using BAR.Application.Articles.GetById;
using BAR.Application.Articles.GetMine;
using BAR.Application.Articles.GetNextNumber;
using BAR.Application.Articles.Update;
using BAR.Host.Validation;

namespace BAR.Host.Features.Articles;

/// <summary>
/// Artikel-Erfassung fuer Verkaeufer (eigene Artikel) und Verwaltung fuer
/// Admins (alle Artikel). Die Command-Bodies (<see cref="CreateArticleCommand"/>,
/// <see cref="UpdateArticleCommand"/>) werden direkt als Request-Body gebunden
/// -- wie in ProfileEndpoints -- damit die dort registrierten FluentValidation-
/// Validatoren ueber <c>ValidationFilter&lt;TCommand&gt;</c> greifen. SellerId
/// (und bei Update die Id) kommen ausschliesslich aus Claim bzw. Route und
/// ueberschreiben per <c>with</c>-Ausdruck, was der Client im Body mitschickt --
/// ein Verkaeufer kann so nie fuer eine fremde SellerId Artikel anlegen/aendern.
/// </summary>
public static class ArticlesEndpoints
{
    public static IEndpointRouteBuilder MapArticlesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/articles/mine", async (
            ClaimsPrincipal user, string? brand, string? category, string? search,
            int? page, int? pageSize, string? sort, GetMyArticlesQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var effectivePage = Math.Max(1, page ?? 1);
            var effectivePageSize = Math.Clamp(pageSize ?? 25, 1, 100);
            var result = await handler.HandleAsync(
                new GetMyArticlesQuery(sellerId, brand, category, search, effectivePage, effectivePageSize, sort), ct);
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapGet("/api/articles/next-number", async (ClaimsPrincipal user, GetNextNumberQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapPost("/api/articles", async (
            ClaimsPrincipal user, CreateArticleCommand command, CreateArticleCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await handler.HandleAsync(command with { SellerId = sellerId }, ct);
            return Results.Created($"/api/articles/{result.Id}", result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<CreateArticleCommand>>();

        app.MapPut("/api/articles/{id}", async (
            ClaimsPrincipal user, string id, UpdateArticleCommand command, UpdateArticleCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await handler.HandleAsync(command with { Id = id, SellerId = sellerId }, ct);
            return Results.Ok(result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<UpdateArticleCommand>>();

        app.MapDelete("/api/articles/{id}", async (ClaimsPrincipal user, string id, DeleteArticleCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await handler.HandleAsync(new DeleteArticleCommand(id, sellerId), ct);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapGet("/api/articles", async (
            string? brand, string? category, string? search, string? sellerId,
            int? page, int? pageSize, string? sort, GetAllArticlesQueryHandler handler, CancellationToken ct) =>
        {
            var effectivePage = Math.Max(1, page ?? 1);
            var effectivePageSize = Math.Clamp(pageSize ?? 25, 1, 100);
            var query = new GetAllArticlesQuery(brand, category, search, sellerId, effectivePage, effectivePageSize, sort);
            return Results.Ok(await handler.HandleAsync(query, ct));
        }).RequireAuthorization("admin");

        app.MapGet("/api/articles/{id}", async (string id, GetArticleByIdQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(id, ct))
        ).RequireAuthorization("admin");

        return app;
    }
}
