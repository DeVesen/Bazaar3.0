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

    /// <summary>
    /// Fester BCrypt-Hash ohne zugehoeriges Passwort. Wird nur verifiziert, um
    /// bei unbekannter E-Mail dieselbe Rechenzeit zu verbrauchen wie bei einem
    /// echten Treffer - der Vergleich kann per Konstruktion nie zutreffen.
    /// </summary>
    private const string DummyPasswordHash =
        "$2a$12$nNtBidjF7mMeu7ST48kZ0eF0577nRtnUm4ix8cr7Ka.hRfEJxmuqO";

    public async Task<TokenPairResult> HandleAsync(LoginCommand command, CancellationToken cancellationToken)
    {
        var seller = await sellers.GetByEmailAsync(command.Email, cancellationToken);

        // Bewusst dieselbe Exception fuer unbekannte E-Mail und falsches
        // Passwort (Epic_Login AC-2).
        //
        // Achtung, die Antwort ist gleich, der Zeitverlauf nur annaehernd: der
        // teure Teil ist der BCrypt-Verify (~250 ms). Bei unbekannter E-Mail
        // gaebe es nichts zu verifizieren, und der schnellere Rueckweg waere
        // per Response-Latenz messbar - also User-Enumeration. Der Verify gegen
        // DummyPasswordHash (Work-Factor 12, identisch zu BCryptPasswordHasher)
        // brennt diese Zeit bewusst ab. Das ist kein konstante-Zeit-Verfahren -
        // Datenbanklaufzeit, Netzwerk und BCryptens eigene Restvarianz auch bei
        // gleichem Work-Factor streuen weiter -, aber es engt die grosse, gut
        // messbare Luecke so weit ein, dass DB-/Netzwerk-Jitter dominiert. Ein
        // echtes constant-time-Login fordert die Spec nicht - akzeptierter
        // Trade-off.
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
        var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));

        if (await refreshTokens.CountActiveForSellerAsync(seller.Id, cancellationToken) >= 5)
        {
            await refreshTokens.DeleteOldestForSellerAsync(seller.Id, cancellationToken);
        }

        await refreshTokens.AddAsync(refreshToken, cancellationToken);

        return new TokenPairResult(accessToken, refreshPlainText);
    }
}
