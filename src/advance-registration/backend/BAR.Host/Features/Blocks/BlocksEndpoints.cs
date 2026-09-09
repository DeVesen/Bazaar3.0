using System.Security.Claims;
using BAR.Application.Blocks.GetMine;

namespace BAR.Host.Features.Blocks;

/// <summary>
/// Eigene Nummernbloecke des angemeldeten Verkaeufers (api/blocks.md
/// Abschnitt 1, Epic_Login AC-13). <c>RequireAuthorization()</c> ohne
/// Policy-Name greift die Default-Policy aus Program.cs ("authenticated",
/// Task 13) - jedes gueltige Token reicht, keine Rolle noetig. Die
/// Seller-Id kommt aus dem <c>sub</c>-Claim, der wegen <c>NameClaimType =
/// "sub"</c> (Program.cs) zugleich <see cref="ClaimsPrincipal.Identity"/>'s
/// Name ist.
/// </summary>
public static class BlocksEndpoints
{
    public static IEndpointRouteBuilder MapBlocksEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/blocks/mine", async (ClaimsPrincipal user, GetMyBlocksQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, ct));
        }).RequireAuthorization();

        return app;
    }
}
