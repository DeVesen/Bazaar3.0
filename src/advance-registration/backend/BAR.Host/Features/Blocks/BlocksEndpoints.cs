using System.Security.Claims;
using BAR.Modules.Registration.Contracts;
using BAR.Modules.Registration.Contracts.Blocks;
using BAR.Host.Validation;

namespace BAR.Host.Features.Blocks;

/// <summary>
/// The logged-in seller's own number blocks (api/blocks.md section 1,
/// Epic_Login AC-13). <c>RequireAuthorization()</c> without a policy name
/// falls back to the default policy from Program.cs ("authenticated") - any
/// valid token is enough, no role required. The seller id comes from the
/// <c>sub</c> claim.
/// </summary>
public static class BlocksEndpoints
{
    public static IEndpointRouteBuilder MapBlocksEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/blocks/mine", async (ClaimsPrincipal user, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await registration.GetMyBlocksAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapGet("/api/blocks/next-free", async (int blockCount, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            if (blockCount < 1)
            {
                return Results.ValidationProblem(new Dictionary<string, string[]>
                {
                    ["blockCount"] = ["blockCount muss mindestens 1 sein"]
                });
            }

            return Results.Ok(await registration.GetNextFreeBlockAsync(blockCount, ct));
        }).RequireAuthorization("admin");

        app.MapGet("/api/sellers/{id}/blocks", async (string id, IRegistrationModuleApi registration, CancellationToken ct) =>
            Results.Ok(await registration.GetBlocksForSellerAsync(id, ct))
        ).RequireAuthorization("admin");

        app.MapPost("/api/sellers/{id}/blocks", async (
            string id, ReserveBlocksCommand body, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            var command = body with { SellerId = id };
            var result = await registration.ReserveBlocksAsync(command, ct);
            return Results.Created($"/api/sellers/{id}/blocks", result);
        }).RequireAuthorization("admin").AddEndpointFilter<ValidationFilter<ReserveBlocksCommand>>();

        app.MapDelete("/api/sellers/{id}/blocks/{blockId}", async (
            string id, string blockId, IRegistrationModuleApi registration, CancellationToken ct) =>
        {
            await registration.DeleteBlockAsync(new DeleteBlockCommand(id, blockId), ct);
            return Results.NoContent();
        }).RequireAuthorization("admin");

        return app;
    }
}
