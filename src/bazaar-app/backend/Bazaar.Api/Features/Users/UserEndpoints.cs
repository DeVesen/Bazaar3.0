using Bazaar.Api.Filters;
using Bazaar.Application.Users;
using Bazaar.Domain.Users;

namespace Bazaar.Api.Features.Users;

public static class UserEndpoints
{
    public static IEndpointRouteBuilder MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/users", async (GetUsersHandler handler) =>
        {
            var users = await handler.Handle();
            return Results.Ok(users.Select(ToDto));
        })
        .RequireAuthorization("admin");

        app.MapPost("/api/users", async (CreateUserCommand command, CreateUserHandler handler) =>
        {
            var user = await handler.Handle(command);
            var dto = new UserDto(user.Id, user.Username, ToRoleString(user.Role), user.MustChangePassword);
            return Results.Created($"/api/users/{user.Id}", dto);
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<CreateUserCommand>>();

        app.MapPut("/api/users/{id}", async (string id, UpdateUserCommand command, UpdateUserHandler handler) =>
        {
            command.Id = id; // filter validates command BEFORE Id is set from the route
            await handler.Handle(command);
            return Results.NoContent();
        })
        .RequireAuthorization("admin")
        .AddEndpointFilter<ValidationFilter<UpdateUserCommand>>();

        app.MapDelete("/api/users/{id}", async (string id, DeleteUserHandler handler) =>
        {
            await handler.Handle(id);
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        return app;
    }

    private static UserDto ToDto(UserListItem item) =>
        new(item.Id, item.Username, ToRoleString(item.Role), item.MustChangePassword);

    private static string ToRoleString(Role role) => role == Role.Admin ? "admin" : "cashier";
}
