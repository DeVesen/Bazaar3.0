namespace BAR.Host.Features.Public;

/// <summary>
/// Liveness ohne Datenbankpruefung (VPROJ-S02 AC-4). Der Readiness-Endpoint
/// <c>GET /health/ready</c> mit Datenbankpruefung wird in <c>Program.cs</c>
/// ueber <c>MapHealthChecks</c> registriert.
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
