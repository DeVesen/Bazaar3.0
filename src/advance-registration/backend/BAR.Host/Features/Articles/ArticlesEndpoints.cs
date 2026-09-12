using System.Security.Claims;
using BAR.Modules.Registration.Contracts;
using BAR.Modules.Registration.Contracts.Articles;
using BAR.Host.Validation;

namespace BAR.Host.Features.Articles;

/// <summary>
/// Article capture for sellers (their own articles) and management for
/// admins (all articles). SellerId (and, on update, the Id) always come
/// from the claim or the route and override whatever the client sends in
/// the body via a <c>with</c> expression.
/// </summary>
public static class ArticlesEndpoints
{
    public static IEndpointRouteBuilder MapArticlesEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/articles/mine", async (
            ClaimsPrincipal user, string? brand, string? category, string? search,
            int? page, int? pageSize, string? sort, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var effectivePage = Math.Max(1, page ?? 1);
            var effectivePageSize = Math.Clamp(pageSize ?? 25, 1, 100);
            var result = await registration.GetMyArticlesAsync(
                new GetMyArticlesQuery(sellerId, brand, category, search, effectivePage, effectivePageSize, sort), ct);
            return Results.Ok(result);
        }).RequireAuthorization();

        app.MapGet("/api/articles/next-number", async (ClaimsPrincipal user, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await registration.GetNextNumberAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapPost("/api/articles", async (
            ClaimsPrincipal user, CreateArticleCommand command, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await registration.CreateArticleAsync(command with { SellerId = sellerId }, ct);
            return Results.Created($"/api/articles/{result.Id}", result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<CreateArticleCommand>>();

        app.MapPut("/api/articles/{id}", async (
            ClaimsPrincipal user, string id, UpdateArticleCommand command, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await registration.UpdateArticleAsync(command with { Id = id, SellerId = sellerId }, ct);
            return Results.Ok(result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<UpdateArticleCommand>>();

        app.MapDelete("/api/articles/{id}", async (ClaimsPrincipal user, string id, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await registration.DeleteArticleAsync(new DeleteArticleCommand(id, sellerId), ct);
            return Results.NoContent();
        }).RequireAuthorization();

        app.MapGet("/api/articles", async (
            string? brand, string? category, string? search, string? sellerId,
            int? page, int? pageSize, string? sort, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var effectivePage = Math.Max(1, page ?? 1);
            var effectivePageSize = Math.Clamp(pageSize ?? 25, 1, 100);
            var query = new GetAllArticlesQuery(brand, category, search, sellerId, effectivePage, effectivePageSize, sort);
            return Results.Ok(await registration.GetAllArticlesAsync(query, ct));
        }).RequireAuthorization("admin");

        app.MapGet("/api/articles/{id}", async (string id, IRegistrationModuleApi registration, CancellationToken ct) =>
            Results.Ok(await registration.GetArticleByIdAsync(id, ct))
        ).RequireAuthorization("admin");

        return app;
    }
}
