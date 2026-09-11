using System.Security.Claims;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Profile;
using BAR.Host.Validation;

namespace BAR.Host.Features.Profile;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/profile", async (ClaimsPrincipal user, IVerkaeuferverwaltungModuleApi verkaeuferverwaltung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await verkaeuferverwaltung.GetProfileAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapPut("/api/profile", async (ClaimsPrincipal user, UpdateProfileCommand command, IVerkaeuferverwaltungModuleApi verkaeuferverwaltung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await verkaeuferverwaltung.UpdateProfileAsync(sellerId, command, ct));
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<UpdateProfileCommand>>();

        app.MapPut("/api/profile/email", async (ClaimsPrincipal user, ChangeEmailCommand command, IVerkaeuferverwaltungModuleApi verkaeuferverwaltung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await verkaeuferverwaltung.ChangeEmailAsync(sellerId, command, ct);
            return Results.NoContent();
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<ChangeEmailCommand>>();

        app.MapPut("/api/profile/password", async (ClaimsPrincipal user, ChangePasswordCommand command, IVerkaeuferverwaltungModuleApi verkaeuferverwaltung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await verkaeuferverwaltung.ChangePasswordAsync(sellerId, command, ct);
            return Results.Ok(result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<ChangePasswordCommand>>();

        app.MapDelete("/api/profile", async (ClaimsPrincipal user, IVerkaeuferverwaltungModuleApi verkaeuferverwaltung, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await verkaeuferverwaltung.DeleteProfileAsync(sellerId, ct);
            return Results.NoContent();
        }).RequireAuthorization();

        return app;
    }
}
