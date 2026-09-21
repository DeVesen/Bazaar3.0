using Bazaar.Infrastructure.Persistence;

namespace Bazaar.Api.Features.Admin;

/// <summary>
/// Dev-only tools for the Settings page's "Datenbank zurücksetzen" button. Mapped only when
/// Environment.IsDevelopment() (see Program.cs) — the routes below simply don't exist in
/// Production, which is how the frontend decides whether to show the button at all.
/// </summary>
public static class DevToolsEndpoints
{
    public static IEndpointRouteBuilder MapDevToolsEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/admin/dev-tools/status", () => Results.Ok(new DevToolsStatusResponse(true)))
            .RequireAuthorization("admin");

        app.MapPost("/api/admin/dev-tools/reset-database", async (DatabaseResetService resetService) =>
        {
            await resetService.ResetAsync();
            return Results.NoContent();
        })
        .RequireAuthorization("admin");

        return app;
    }
}

public record DevToolsStatusResponse(bool IsDevelopment);
