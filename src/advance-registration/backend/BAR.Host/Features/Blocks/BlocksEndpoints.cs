using System.Security.Claims;
using BAR.Application.Blocks.Delete;
using BAR.Application.Blocks.GetMine;
using BAR.Application.Blocks.NextFree;
using BAR.Application.Blocks.Reserve;
using BAR.Domain.Ports;

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

        app.MapGet("/api/blocks/next-free", async (int blockCount, GetNextFreeQueryHandler handler, CancellationToken ct) =>
            Results.Ok(await handler.HandleAsync(new GetNextFreeQuery(blockCount), ct))
        ).RequireAuthorization("admin");

        app.MapGet("/api/sellers/{id}/blocks", async (
            string id, INumberBlockRepository blocks, IArticleRepository articles, CancellationToken ct) =>
        {
            var sellerBlocks = await blocks.GetForSellerAsync(id, ct);
            var responses = new List<BlockResponse>();
            foreach (var block in sellerBlocks)
            {
                var usedCount = await articles.CountInRangeForSellerAsync(block.SellerId, block.FromNumber, block.ToNumber, ct);
                responses.Add(new BlockResponse(block.Id, block.SellerId, block.FromNumber, block.ToNumber, block.ToNumber - block.FromNumber + 1, usedCount, block.AssignedAt));
            }
            return Results.Ok(responses);
        }).RequireAuthorization("admin");

        app.MapPost("/api/sellers/{id}/blocks", async (
            string id, ReserveBlocksRequestBody body, ReserveBlocksCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(new ReserveBlocksCommand(id, body.StartNumber, body.BlockCount), ct);
            return Results.Created($"/api/sellers/{id}/blocks", result);
        }).RequireAuthorization("admin");

        app.MapDelete("/api/sellers/{id}/blocks/{blockId}", async (
            string id, string blockId, DeleteBlockCommandHandler handler, CancellationToken ct) =>
        {
            await handler.HandleAsync(new DeleteBlockCommand(id, blockId), ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}

public sealed record ReserveBlocksRequestBody(int? StartNumber, int? BlockCount);
