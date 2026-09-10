using System.Security.Claims;
using BAR.Application.Profile.ChangeEmail;
using BAR.Application.Profile.ChangePassword;
using BAR.Application.Profile.DeleteProfile;
using BAR.Application.Profile.GetProfile;
using BAR.Application.Profile.UpdateProfile;
using BAR.Host.Validation;

namespace BAR.Host.Features.Profile;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/profile", async (ClaimsPrincipal user, GetProfileQueryHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapPut("/api/profile", async (ClaimsPrincipal user, UpdateProfileCommand command, UpdateProfileCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await handler.HandleAsync(sellerId, command, ct));
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<UpdateProfileCommand>>();

        app.MapPut("/api/profile/email", async (ClaimsPrincipal user, ChangeEmailCommand command, ChangeEmailCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await handler.HandleAsync(sellerId, command, ct);
            return Results.NoContent();
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<ChangeEmailCommand>>();

        app.MapPut("/api/profile/password", async (ClaimsPrincipal user, ChangePasswordCommand command, ChangePasswordCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await handler.HandleAsync(sellerId, command, ct);
            return Results.Ok(result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<ChangePasswordCommand>>();

        app.MapDelete("/api/profile", async (ClaimsPrincipal user, DeleteProfileCommandHandler handler, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await handler.HandleAsync(sellerId, ct);
            return Results.NoContent();
        }).RequireAuthorization();

        return app;
    }
}
