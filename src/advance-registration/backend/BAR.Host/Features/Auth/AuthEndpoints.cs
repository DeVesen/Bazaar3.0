using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Host.Validation;

namespace BAR.Host.Features.Auth;

public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").AllowAnonymous();

        group.MapPost("/register", async (RegisterCommand command, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var result = await sellerManagement.RegisterAsync(command, ct);
            return Results.Created("/api/auth/register", new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<RegisterCommand>>();

        group.MapPost("/login", async (LoginCommand command, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var result = await sellerManagement.LoginAsync(command, ct);
            return Results.Ok(new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<LoginCommand>>();

        group.MapPost("/refresh", async (RefreshCommand command, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var result = await sellerManagement.RefreshAsync(command, ct);
            return Results.Ok(new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<RefreshCommand>>();

        group.MapPost("/set-password", async (SetPasswordCommand command, ISellerManagementModuleApi sellerManagement, CancellationToken ct) =>
        {
            var result = await sellerManagement.SetPasswordAsync(command, ct);
            return Results.Ok(new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<SetPasswordCommand>>();

        return app;
    }
}

public sealed record TokenPairResponse(string AccessToken, string RefreshToken);
