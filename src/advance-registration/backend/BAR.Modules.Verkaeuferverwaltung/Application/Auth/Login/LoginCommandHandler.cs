using BAR.Modules.Verkaeuferverwaltung.Application.Abstractions;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Auth;
using BAR.Modules.Verkaeuferverwaltung.Domain.Auth;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Auth.Login;

public sealed class LoginCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock)
{
    private const string InvalidCredentialsMessage = "Ungültige Anmeldedaten";

    /// <summary>
    /// Fester BCrypt-Hash ohne zugehoeriges Passwort. Wird nur verifiziert, um
    /// bei unbekannter E-Mail dieselbe Rechenzeit zu verbrauchen wie bei einem
    /// echten Treffer (Epic_Login AC-2) - kein constant-time-Login, aber die
    /// gut messbare Luecke wird eng genug, dass DB-/Netzwerk-Jitter dominiert.
    /// </summary>
    private const string DummyPasswordHash =
        "$2a$12$nNtBidjF7mMeu7ST48kZ0eF0577nRtnUm4ix8cr7Ka.hRfEJxmuqO";

    public async Task<TokenPairDto> HandleAsync(LoginCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByEmailAsync(command.Email, cancellationToken);

        if (seller?.PasswordHash is null)
        {
            _ = passwordHasher.Verify(command.Password, DummyPasswordHash);
            throw new UnauthorizedException("auth.invalid_credentials", InvalidCredentialsMessage);
        }

        if (!passwordHasher.Verify(command.Password, seller.PasswordHash))
        {
            throw new UnauthorizedException("auth.invalid_credentials", InvalidCredentialsMessage);
        }

        await refreshTokens.DeleteExpiredForSellerAsync(seller.Id, clock.UtcNow, cancellationToken);

        var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
        var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
        var refreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));

        if (await refreshTokens.CountActiveForSellerAsync(seller.Id, cancellationToken) >= 5)
        {
            await refreshTokens.DeleteOldestForSellerAsync(seller.Id, cancellationToken);
        }

        await refreshTokens.AddAsync(refreshToken, cancellationToken);

        return new TokenPairDto(accessToken, refreshPlainText);
    }
}
