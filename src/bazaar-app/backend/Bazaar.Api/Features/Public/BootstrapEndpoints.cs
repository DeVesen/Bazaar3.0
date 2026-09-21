using Bazaar.Api.Filters;
using Bazaar.Application.Auth;

namespace Bazaar.Api.Features.Public;

public static class BootstrapEndpoints
{
    public static IEndpointRouteBuilder MapBootstrapEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/bootstrap-status", (AdminBootstrapState state) =>
            Results.Ok(new BootstrapStatusResponse(state.HasAdmin)))
        .AllowAnonymous();

        app.MapPost("/api/public/bootstrap-admin", async (BootstrapAdminCommand command, BootstrapAdminHandler handler) =>
        {
            var accessToken = await handler.Handle(command);
            return Results.Ok(new BootstrapAdminResponse(accessToken));
        })
        .AllowAnonymous()
        .AddEndpointFilter<ValidationFilter<BootstrapAdminCommand>>();

        app.MapPost("/api/public/setup-complete", async (CompleteSetupCommand command, CompleteSetupHandler handler) =>
        {
            await handler.Handle(command);
            return Results.NoContent();
        })
        .AllowAnonymous()
        .AddEndpointFilter<ValidationFilter<CompleteSetupCommand>>();

        return app;
    }
}
