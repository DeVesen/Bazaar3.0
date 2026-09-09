using BAR.Application.Abstractions;
using BAR.Domain.Auth;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Auth.Refresh;

public sealed class RefreshCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    ITokenIssuer tokenIssuer,
    IClock clock)
{
    public async Task<TokenPairResult> HandleAsync(RefreshCommand command, CancellationToken cancellationToken)
    {
        var hash = RefreshToken.HashOf(command.RefreshToken);
        var existing = await refreshTokens.GetByHashAsync(hash, cancellationToken)
            ?? throw new UnauthorizedException("auth.invalid_refresh_token", "Refresh-Token unbekannt oder bereits verwendet");

        if (existing.ExpiresAt <= clock.UtcNow)
        {
            throw new UnauthorizedException("auth.invalid_refresh_token", "Refresh-Token abgelaufen");
        }

        var seller = await sellers.GetByIdAsync(existing.SellerId, cancellationToken)
            ?? throw new UnauthorizedException("auth.invalid_refresh_token", "Verkäufer nicht mehr vorhanden");

        // Rotation: alte Zeile loeschen, neue anlegen. Kein Repository-Transaction-Scope
        // hier noetig, solange beide Aufrufe in derselben DbContext-Instanz
        // (Scoped Lifetime) laufen - SaveChanges je Repository-Methode reicht,
        // weil zwischen beiden kein weiterer Request denselben Hash sehen kann.
        await refreshTokens.DeleteAsync(existing.Id, cancellationToken);

        var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
        var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
        var newRefreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
        await refreshTokens.AddAsync(newRefreshToken, cancellationToken);

        return new TokenPairResult(accessToken, refreshPlainText);
    }
}
