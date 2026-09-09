using System.Security.Claims;
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

        return app;
    }
}
