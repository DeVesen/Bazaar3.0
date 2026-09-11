using System.Security.Claims;

namespace BAR.Host.Features.Home;

public static class HomeEndpoints
{
    public static IEndpointRouteBuilder MapHomeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/home/seller", async (ClaimsPrincipal user, HomeCompositionService composer, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await composer.GetSellerHomeAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapGet("/api/home/admin", async (HomeCompositionService composer, CancellationToken ct) =>
            Results.Ok(await composer.GetAdminHomeAsync(ct)))
            .RequireAuthorization("admin");

        return app;
    }
}
