using Bazaar.Api.Filters;
using Bazaar.Application.Articles;

namespace Bazaar.Api.Features.Articles;

public static class ArticleEndpoints
{
    public static IEndpointRouteBuilder MapArticleEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/articles", async (
            string? q,
            string? brand,
            string? category,
            string? status,
            string? sort,
            int? page,
            int? pageSize,
            GetArticlesHandler handler) =>
        {
            var result = await handler.Handle(q, brand, category, status, sort, page ?? 1, pageSize ?? 50);
            var dto = new
            {
                items = result.Items.Select(a => new ArticleListItemDto(
                    a.Id, a.Number, a.Name, a.Brand, a.Category, a.Price,
                    a.Status, a.SoldManually, a.SellerId, a.SellerName)),
                totalCount = result.TotalCount,
                page = result.Page,
                pageSize = result.PageSize
            };
            return Results.Ok(dto);
        })
        .RequireAuthorization();

        // GET /api/articles/{id} (Round-15 review fix): full Stammdaten plus raw status
        // timestamps to seed `artikel-dialog`/`article-status-popup` — see
        // `GetArticleByIdHandler`'s doc comment for why the list DTO above doesn't carry
        // enough for that. Mirrors `GET /api/sellers/{id}`'s precedent (Round-14 Task 10 fix).
        app.MapGet("/api/articles/{id}", async (string id, GetArticleByIdHandler handler) =>
        {
            var (article, sellerName, sellerSettledAt) = await handler.Handle(id);
            var dto = new ArticleDetailDto(
                article.Id, article.Number, article.Name, article.Brand, article.Category, article.Price,
                article.Size, article.Color, article.Description,
                article.Status.ToString().ToLowerInvariant(), article.SoldManually,
                article.SellerId, sellerName,
                article.CreatedAt, article.ReleasedAt, article.SoldAt, article.ReturnedAt,
                sellerSettledAt);
            return Results.Ok(dto);
        })
        .RequireAuthorization();

        app.MapPut("/api/articles/{id}", async (string id, UpdateArticleCommand command, UpdateArticleHandler handler) =>
        {
            command.Id = id;
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<UpdateArticleCommand>>();

        // No ValidationFilter<UpdateArticleTimestampsCommand> here: this command
        // deliberately has no FluentValidation validator (Task 4 §5) — the
        // cascade rule is a domain invariant enforced inside
        // Article.SetTimestamps, not a format-validation concern.
        // ValidationFilter<T> itself would no-op safely (it resolves
        // IValidator<T> and calls next() when none is registered), but adding
        // it here would be misleading — it would imply validation happens
        // where none is registered.
        app.MapPut("/api/articles/{id}/timestamps", async (string id, UpdateArticleTimestampsCommand command, UpdateArticleTimestampsHandler handler) =>
        {
            command.Id = id;
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        app.MapDelete("/api/articles/{id}", async (string id, DeleteArticleHandler handler) =>
        {
            await handler.Handle(id);
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        return app;
    }
}
