namespace BAR.Host.Features.Public;

/// <summary>
/// Liveness ohne Datenbankpruefung (VPROJ-S02 AC-4). Der Readiness-Endpoint
/// <c>GET /health/ready</c> mit Datenbankpruefung entsteht in VPROJ-S04.
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
