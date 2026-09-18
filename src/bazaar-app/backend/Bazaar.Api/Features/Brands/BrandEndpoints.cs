using System.Security.Claims;
using Bazaar.Api.Filters;
using Bazaar.Application.Brands;

namespace Bazaar.Api.Features.Brands;

public static class BrandEndpoints
{
    public static IEndpointRouteBuilder MapBrandEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/brands", async (GetBrandsHandler handler) =>
        {
            var brands = await handler.Handle();
            return Results.Ok(brands.Select(b => new BrandDto(b.Id, b.Name, b.Original, b.ArticleCount)));
        })
        .RequireAuthorization();

        app.MapPost("/api/brands", async (CreateBrandCommand command, ClaimsPrincipal user, CreateBrandHandler handler) =>
        {
            // Filter above validates `command` (Name only) before Original is set — fine,
            // same precedent as ChangePasswordCommand.UserId in AuthEndpoints.cs. Original is
            // deliberately not part of the wire contract (api/master-data.md #2): the server
            // derives it from the caller's role, not from client input.
            command.Original = user.FindFirst("role")?.Value == "admin";
            var brand = await handler.Handle(command);
            var dto = new BrandDto(brand.Id, brand.Name, brand.Original, 0);
            return Results.Created($"/api/brands/{brand.Id}", dto);
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<CreateBrandCommand>>();

        app.MapPut("/api/brands/{id}", async (string id, UpdateBrandCommand command, UpdateBrandHandler handler) =>
        {
            // Filter above validates `command` (Name only) before Id is set from the route
            // value — same precedent as ChangePasswordCommand.UserId in AuthEndpoints.cs.
            command.Id = id;
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<UpdateBrandCommand>>();

        app.MapDelete("/api/brands/{id}", async (string id, DeleteBrandHandler handler) =>
        {
            await handler.Handle(id);
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        return app;
    }
}
