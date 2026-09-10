using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Auth.SetPassword;

public sealed class SetPasswordCommandHandler(
    ISellerRepository sellers, IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher, ITokenIssuer tokenIssuer, IClock clock,
    IUnitOfWork unitOfWork)
{
    public async Task<TokenPairResult> HandleAsync(SetPasswordCommand command, CancellationToken cancellationToken)
    {
        TokenPairResult? result = null;

        // Invite-Verbrauch, Passwort-Setzen und Refresh-Token sind ein einziger
        // fachlicher Vorgang. Ohne diese Klammer koennte ein Fehler nach dem
        // UpdateAsync (Invite-Token verbraucht) aber vor dem AddAsync (kein
        // Refresh-Token) einen Verkaeufer ohne Login-Moeglichkeit zuruecklassen,
        // dessen Invite-Token bereits verbrannt ist.
        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var seller = await sellers.GetByInviteTokenAsync(command.InviteToken, ct)
                ?? throw new UnauthorizedException("auth.invalid_invite_token", "Token unbekannt, bereits verbraucht oder abgelaufen");

            seller.ConsumePassword(passwordHasher.Hash(command.Password), clock.UtcNow);
            await sellers.UpdateAsync(seller, ct);

            await refreshTokens.DeleteExpiredForSellerAsync(seller.Id, clock.UtcNow, ct);

            var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
            var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
            var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairResult(accessToken, refreshPlainText);
        }, cancellationToken);

        return result!;
    }
}
