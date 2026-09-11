using BAR.Modules.Verkaeuferverwaltung.Application.Abstractions;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Auth;
using BAR.Modules.Verkaeuferverwaltung.Domain.Auth;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Auth.Refresh;

public sealed class RefreshCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    ITokenIssuer tokenIssuer,
    IClock clock,
    IUnitOfWork unitOfWork)
{
    public async Task<TokenPairDto> HandleAsync(RefreshCommand command, CancellationToken cancellationToken)
    {
        TokenPairDto? result = null;

        // Rotation ist Loeschen plus Anlegen. Ohne Transaktionsklammer waeren das
        // zwei Commits: schlaegt das Anlegen fehl, ist die alte Zeile bereits weg
        // und der Nutzer aus allen Sessions geworfen.
        await unitOfWork.ExecuteInTransactionAsync(
            async ct => result = await RotateAsync(command, ct),
            cancellationToken);

        return result!;
    }

    private async Task<TokenPairDto> RotateAsync(RefreshCommand command, CancellationToken cancellationToken)
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

        await refreshTokens.DeleteAsync(existing.Id, cancellationToken);

        var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
        var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
        var newRefreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
        await refreshTokens.AddAsync(newRefreshToken, cancellationToken);

        return new TokenPairDto(accessToken, refreshPlainText);
    }
}
