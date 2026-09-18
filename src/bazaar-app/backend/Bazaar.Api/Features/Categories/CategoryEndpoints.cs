using System.Security.Claims;
using Bazaar.Api.Filters;
using Bazaar.Application.Categories;

namespace Bazaar.Api.Features.Categories;

public static class CategoryEndpoints
{
    public static IEndpointRouteBuilder MapCategoryEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/categories", async (GetCategoriesHandler handler) =>
        {
            var categories = await handler.Handle();
            return Results.Ok(categories.Select(c => new CategoryDto(c.Id, c.Name, c.Original, c.ArticleCount)));
        })
        .RequireAuthorization();

        app.MapPost("/api/categories", async (CreateCategoryCommand command, ClaimsPrincipal user, CreateCategoryHandler handler) =>
        {
            // Filter above validates `command` (Name only) before Original is set — fine,
            // same precedent as ChangePasswordCommand.UserId in AuthEndpoints.cs. Original is
            // deliberately not part of the wire contract (api/master-data.md #2): the server
            // derives it from the caller's role, not from client input.
            command.Original = user.FindFirst("role")?.Value == "admin";
            var category = await handler.Handle(command);
            var dto = new CategoryDto(category.Id, category.Name, category.Original, 0);
            return Results.Created($"/api/categories/{category.Id}", dto);
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<CreateCategoryCommand>>();

        app.MapPut("/api/categories/{id}", async (string id, UpdateCategoryCommand command, UpdateCategoryHandler handler) =>
        {
            // Filter above validates `command` (Name only) before Id is set from the route
            // value — same precedent as ChangePasswordCommand.UserId in AuthEndpoints.cs.
            command.Id = id;
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<UpdateCategoryCommand>>();

        app.MapDelete("/api/categories/{id}", async (string id, DeleteCategoryHandler handler) =>
        {
            await handler.Handle(id);
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        return app;
    }
}
