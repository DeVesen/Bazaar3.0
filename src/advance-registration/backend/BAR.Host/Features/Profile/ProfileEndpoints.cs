using System.Security.Claims;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Profile;
using BAR.Host.Validation;

namespace BAR.Host.Features.Profile;

public static class ProfileEndpoints
{
    public static IEndpointRouteBuilder MapProfileEndpoints(this IEndpointRouteBuilder app)
    {
        app.MapGet("/api/profile", async (ClaimsPrincipal user, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await sellerManagement.GetProfileAsync(sellerId, ct));
        }).RequireAuthorization();

        app.MapPut("/api/profile", async (ClaimsPrincipal user, UpdateProfileCommand command, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            return Results.Ok(await sellerManagement.UpdateProfileAsync(sellerId, command, ct));
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<UpdateProfileCommand>>();

        app.MapPut("/api/profile/email", async (ClaimsPrincipal user, ChangeEmailCommand command, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await sellerManagement.ChangeEmailAsync(sellerId, command, ct);
            return Results.NoContent();
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<ChangeEmailCommand>>();

        app.MapPut("/api/profile/password", async (ClaimsPrincipal user, ChangePasswordCommand command, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            var result = await sellerManagement.ChangePasswordAsync(sellerId, command, ct);
            return Results.Ok(result);
        }).RequireAuthorization().AddEndpointFilter<ValidationFilter<ChangePasswordCommand>>();

        app.MapDelete("/api/profile", async (ClaimsPrincipal user, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var sellerId = user.FindFirstValue("sub")!;
            await sellerManagement.DeleteProfileAsync(sellerId, ct);
            return Results.NoContent();
        }).RequireAuthorization();

        return app;
    }
}
