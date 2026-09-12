using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Auth.Refresh;

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

        // Rotation is delete plus create. Without a transaction that would be
        // two commits: if the create fails, the old row is already gone and
        // the user is kicked out of all sessions.
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
