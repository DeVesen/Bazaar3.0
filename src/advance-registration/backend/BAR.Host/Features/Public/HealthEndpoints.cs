namespace BAR.Host.Features.Public;

/// <summary>
/// Liveness check without a database check (VPROJ-S02 AC-4). The readiness
/// endpoint <c>GET /health/ready</c>, which does check the database, is
/// registered in <c>Program.cs</c> via <c>MapHealthChecks</c>.
/// </summary>
public static class HealthEndpoints
{
    public static IEndpointRouteBuilder MapHealthEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/health", () => Results.Ok(new HealthResponse("healthy")))
            .WithName("GetHealth")
            .AllowAnonymous();

        return app;
    }
}

public sealed record HealthResponse(string Status);
