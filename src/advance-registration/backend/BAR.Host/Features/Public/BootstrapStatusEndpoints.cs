using BAR.Modules.SellerManagement.Contracts;

namespace BAR.Host.Features.Public;

/// <summary>
/// Lets the frontend decide, before rendering login, whether to route to
/// /bootstrap-admin instead (no admin exists yet). Reads
/// AdminBootstrapState (computed once at startup) via the module API - no
/// per-request database query.
/// </summary>
public static class BootstrapStatusEndpoints
{
    public static IEndpointRouteBuilder MapBootstrapStatusEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/public/bootstrap-status", async (ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
            Results.Ok(new BootstrapStatusResponse(await sellerManagement.HasAdminAsync(ct))))
            .AllowAnonymous();

        return app;
    }
}

public sealed record BootstrapStatusResponse(bool HasAdmin);
