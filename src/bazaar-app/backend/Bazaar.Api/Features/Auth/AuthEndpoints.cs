using System.Security.Claims;
using Bazaar.Api.Filters;
using Bazaar.Application.Auth;

namespace Bazaar.Api.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapPost("/api/auth/login", async (LoginCommand command, LoginHandler handler) =>
        {
            var token = await handler.Handle(command);
            return Results.Ok(new LoginResponse(token));
        })
        .AllowAnonymous()
        .AddEndpointFilter<ValidationFilter<LoginCommand>>();

        app.MapPut("/api/auth/password", async (ChangePasswordCommand body, ClaimsPrincipal user, ChangePasswordHandler handler) =>
        {
            // Filter above validates `body` before UserId is set — fine, since
            // validation rules only concern CurrentPassword/NewPassword.
            body.UserId = user.FindFirst("sub")!.Value;
            var newToken = await handler.Handle(body);
            return newToken is null ? Results.NoContent() : Results.Ok(new LoginResponse(newToken));
        })
        .RequireAuthorization()
        .AddEndpointFilter<ValidationFilter<ChangePasswordCommand>>();

        return app;
    }
}
