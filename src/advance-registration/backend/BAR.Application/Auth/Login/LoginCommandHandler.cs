using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Auth.Login;

public sealed class LoginCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock)
{
    private const string InvalidCredentialsMessage = "Ungültige Anmeldedaten";

    public async Task<TokenPairResult> HandleAsync(LoginCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByEmailAsync(command.Email, cancellationToken);

        // Bewusst dieselbe Exception fuer unbekannte E-Mail und falsches
        // Passwort (Epic_Login AC-2) - kein Unterschied im Timing-Pfad, der
        // verraet, welcher Teil falsch war.
        if (seller?.PasswordHash is null || !passwordHasher.Verify(command.Password, seller.PasswordHash))
        {
            throw new UnauthorizedException("auth.invalid_credentials", InvalidCredentialsMessage);
        }

        await refreshTokens.DeleteExpiredForSellerAsync(seller.Id, clock.UtcNow, cancellationToken);

        var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
        var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
        var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));

        if (await refreshTokens.CountActiveForSellerAsync(seller.Id, cancellationToken) >= 5)
        {
            await refreshTokens.DeleteOldestForSellerAsync(seller.Id, cancellationToken);
        }

        await refreshTokens.AddAsync(refreshToken, cancellationToken);

        return new TokenPairResult(accessToken, refreshPlainText);
    }
}
