using BAR.Modules.Operations.Contracts;

namespace BAR.Host.Features.Public;

/// <summary>
/// Public bazaar info without a token (api/public.md section 1, Epic_Login
/// AC-12). The handler is null-safe for a missing settings row, so the
/// endpoint always returns <c>200</c>.
/// </summary>
public static class PublicInfoEndpoints
{
    public static IEndpointRouteBuilder MapPublicInfoEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/info", async (IOperationsModuleApi operations, CancellationToken ct) =>
            Results.Ok(await operations.GetPublicInfoAsync(ct)))
            .AllowAnonymous();

        return app;
    }
}
