using BAR.Application.Auth.Login;
using BAR.Application.Auth.Refresh;
using BAR.Application.Auth.Register;
using BAR.Application.Auth.SetPassword;
using BAR.Host.Validation;

namespace BAR.Host.Features.Auth;

/// <summary>
/// Bindet die Application-Commands (<see cref="RegisterCommand"/>,
/// <see cref="LoginCommand"/>, <see cref="RefreshCommand"/>) direkt als
/// Minimal-API-Parameter statt eigener Request-DTOs (Positional-Record-Binding
/// funktioniert in .NET 10 zuverlaessig) - vermeidet Duplikat-Validatoren fuer
/// ein reines Pass-through-DTO. <see cref="ValidationFilter{TRequest}"/> aus
/// Task 13 greift damit direkt auf den Application-Validator zu.
/// </summary>
public static class AuthEndpoints
{
    public static IEndpointRouteBuilder MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth").AllowAnonymous();

        group.MapPost("/register", async (RegisterCommand command, RegisterCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command, ct);
            return Results.Created("/api/auth/register", new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<RegisterCommand>>();

        group.MapPost("/login", async (LoginCommand command, LoginCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command, ct);
            return Results.Ok(new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<LoginCommand>>();

        // Der Validator prueft nur "vorhanden" - alles Weitere entscheidet der
        // Handler (UnauthorizedException bei unbekanntem/abgelaufenem Hash).
        // Ohne ihn bindet ein Body wie {} den Token auf null und der Handler
        // wirft eine ArgumentNullException, also 500 statt 400.
        group.MapPost("/refresh", async (RefreshCommand command, RefreshCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command, ct);
            return Results.Ok(new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<RefreshCommand>>();

        group.MapPost("/set-password", async (SetPasswordCommand command, SetPasswordCommandHandler handler, CancellationToken ct) =>
        {
            var result = await handler.HandleAsync(command, ct);
            return Results.Ok(new TokenPairResponse(result.AccessToken, result.RefreshToken));
        }).AddEndpointFilter<ValidationFilter<SetPasswordCommand>>();

        return app;
    }
}

public sealed record TokenPairResponse(string AccessToken, string RefreshToken);
