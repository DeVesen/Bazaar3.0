using System.Security.Claims;
using Bazaar.Api.Filters;
using Bazaar.Application.Sellers;

namespace Bazaar.Api.Features.Sellers;

public static class SellerEndpoints
{
    public static IEndpointRouteBuilder MapSellerEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/sellers", async (
            string? q,
            string? status,
            string? sort,
            int? page,
            int? pageSize,
            GetSellerCardsHandler handler) =>
        {
            var result = await handler.Handle(q, status, sort, page ?? 1, pageSize ?? 60);
            var dto = new
            {
                items = result.Items.Select(c => new SellerCardDto(
                    c.Id,
                    c.FirstName,
                    c.LastName,
                    c.PostalCode,
                    c.City,
                    c.SellerType,
                    c.Status,
                    c.ArticleCount,
                    c.ReleasedCount,
                    c.SoldCount,
                    c.ReturnedCount,
                    c.AcceptedValue,
                    c.OpenValue,
                    c.Revenue,
                    c.SettledAt)),
                totalCount = result.TotalCount,
                page = result.Page,
                pageSize = result.PageSize
            };
            return Results.Ok(dto);
        })
        .RequireAuthorization();

        app.MapGet("/api/sellers/search", async (string? q, SearchSellersHandler handler) =>
        {
            var results = await handler.Handle(q);
            return Results.Ok(results.Select(r => new SellerSearchResultDto(r.Id, r.FirstName, r.LastName, r.City, r.SellerType, r.SettledAt)));
        })
        .RequireAuthorization();

        app.MapPost("/api/sellers", async (CreateSellerCommand command, CreateSellerHandler handler) =>
        {
            var seller = await handler.Handle(command);
            var dto = new SellerDetailDto(
                seller.Id,
                seller.FirstName,
                seller.LastName,
                seller.Address,
                seller.PostalCode,
                seller.City,
                seller.Phone,
                seller.Email,
                seller.SellerTypeId,
                seller.SalesCommission,
                seller.FeePerItem,
                "open",
                ArticleCount: 0,
                ReleasedCount: 0,
                SoldCount: 0,
                ReturnedCount: 0,
                AcceptedValue: 0,
                OpenValue: 0,
                Revenue: 0,
                SettledAt: null);
            return Results.Created($"/api/sellers/{seller.Id}", dto);
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<CreateSellerCommand>>();

        app.MapGet("/api/sellers/{id}", async (string id, GetSellerByIdHandler handler) =>
        {
            var seller = await handler.Handle(id);
            var dto = new SellerDto(
                seller.Id,
                seller.FirstName,
                seller.LastName,
                seller.Address,
                seller.PostalCode,
                seller.City,
                seller.Phone,
                seller.Email,
                seller.SellerTypeId,
                seller.SalesCommission,
                seller.FeePerItem,
                seller.IntakeFeePaid,
                seller.SettledAt,
                seller.PayoutAmount);
            return Results.Ok(dto);
        })
        .RequireAuthorization();

        app.MapPut("/api/sellers/{id}", async (string id, UpdateSellerCommand command, ClaimsPrincipal user, UpdateSellerHandler handler) =>
        {
            // Filter above validates `command` (Stammdaten/Konditionen) before
            // Id and CallerIsAdmin are set — same precedent as
            // BrandEndpoints.cs's PUT /api/brands/{id} (Id) and POST
            // /api/brands (Original, from the role claim).
            command.Id = id;
            command.CallerIsAdmin = user.FindFirst("role")?.Value == "admin";
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<UpdateSellerCommand>>();

        app.MapDelete("/api/sellers/{id}", async (string id, ClaimsPrincipal user, DeleteSellerHandler handler) =>
        {
            await handler.Handle(id, user.FindFirst("role")?.Value == "admin");
            return Results.NoContent();
        })
        .RequireAuthorization();

        app.MapGet("/api/sellers/{id}/articles", async (string id, GetSellerArticlesHandler handler) =>
        {
            var articles = await handler.Handle(id);
            return Results.Ok(articles.Select(a => new ArticleSummaryDto(
                a.Id, a.Number, a.Name, a.Brand, a.Category, a.Size, a.Color, a.Price, a.Status, a.SoldManually)));
        })
        .RequireAuthorization();

        app.MapDelete("/api/sellers/{id}/settlement", async (string id, ResetSellerSettlementHandler handler) =>
        {
            await handler.Handle(id);
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        return app;
    }
}
