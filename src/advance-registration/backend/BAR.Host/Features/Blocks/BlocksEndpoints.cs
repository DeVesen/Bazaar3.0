using System.Security.Claims;
using BAR.Modules.Anmeldung.Contracts;
using BAR.Modules.Anmeldung.Contracts.Blocks;
using BAR.Host.Validation;

namespace BAR.Host.Features.Blocks;

/// <summary>
/// Eigene Nummernbloecke des angemeldeten Verkaeufers (api/blocks.md
/// Abschnitt 1, Epic_Login AC-13). <c>RequireAuthorization()</c> ohne
/// Policy-Name greift die Default-Policy aus Program.cs ("authenticated") -
/// jedes gueltige Token reicht, keine Rolle noetig. Die Seller-Id kommt aus
/// dem <c>sub</c>-Claim.
/// </summary>
public static class BlocksEndpoints
{
    public static IEndpointRouteBuilder MapBlocksEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/blocks/mine", async (ClaimsPrincipal user, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await anmeldung.GetMyBlocksAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapGet("/api/blocks/next-free", async (int blockCount, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            if (blockCount < 1)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["blockCount"] = ["blockCount muss mindestens 1 sein"]
                });
            }

            return Results.Ok(await anmeldung.GetNextFreeBlockAsync(blockCount, ct));
        }).RequireAuthorization("admin");

        app.MapGet("/api/sellers/{id}/blocks", async (string id, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
            Results.Ok(await anmeldung.GetBlocksForSellerAsync(id, ct))
        ).RequireAuthorization("admin");

        app.MapPost("/api/sellers/{id}/blocks", async (
            string id, ReserveBlocksCommand body, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            var command = body with { SellerId = id };
            var result = await anmeldung.ReserveBlocksAsync(command, ct);
            return Results.Created($"/api/sellers/{id}/blocks", result);
        }).RequireAuthorization("admin").AddEndpointFilter<ValidationFilter<ReserveBlocksCommand>>();

        app.MapDelete("/api/sellers/{id}/blocks/{blockId}", async (
            string id, string blockId, IAnmeldungModuleApi anmeldung, CancellationToken ct) =>
        {
            await anmeldung.DeleteBlockAsync(new DeleteBlockCommand(id, blockId), ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
