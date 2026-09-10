using System.Security.Claims;
using BAR.Application.Home.GetAdminHome;
using BAR.Application.Home.GetSellerHome;

namespace BAR.Host.Features.Home;

public static class HomeEndpoints
{
    public static IEndpointRouteBuilder MapHomeEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/home/seller", async (ClaimsPrincipal user, GetSellerHomeQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapGet("/api/home/admin", async (GetAdminHomeQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(ct)))
            .RequireAuthorization("admin");

        return app;
    }
}
