using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Auth.SetPassword;

public sealed class SetPasswordCommandHandler(
    ISellerRepository sellers, IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher, ITokenIssuer tokenIssuer, IClock clock,
    IUnitOfWork unitOfWork)
{
    public async Task<TokenPairDto> HandleAsync(SetPasswordCommand command, CancellationToken cancellationToken)
    {
        TokenPairDto? result = null;

        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var seller = await sellers.GetByInviteTokenAsync(command.InviteToken, ct)
                ?? throw new UnauthorizedException("auth.invalid_invite_token", "Token unbekannt, bereits verbraucht oder abgelaufen");

            seller.ConsumePassword(passwordHasher.Hash(command.Password), clock.UtcNow);
            await sellers.UpdateAsync(seller, ct);

            await refreshTokens.DeleteExpiredForSellerAsync(seller.Id, clock.UtcNow, ct);

            var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
            var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
            var refreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairDto(accessToken, refreshPlainText);
        }, cancellationToken);

        return result!;
    }
}
