using BAR.Application.Abstractions;
using BAR.Application.Auth;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.Profile.ChangePassword;

public sealed class ChangePasswordCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock,
    IUnitOfWork unitOfWork)
{
    public async Task<TokenPairResult> HandleAsync(string sellerId, ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        TokenPairResult? result = null;

        // Passwort-Aenderung, Abmelden aller Geraete und Ausstellen des neuen
        // Token-Paars sind ein einziger fachlicher Vorgang (R07 AC-3) - sonst
        // koennte ein Fehler nach dem Loeschen der alten Tokens das aufrufende
        // Geraet ohne jedes gueltige Token zuruecklassen.
        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var seller = await sellers.GetByIdAsync(sellerId, ct)
                ?? throw new NotFoundException("seller.not_found", "Verkaeufer nicht gefunden");

            if (seller.PasswordHash is null || !passwordHasher.Verify(command.CurrentPassword, seller.PasswordHash))
            {
                throw new UnauthorizedException("auth.invalid_credentials", "Ungültiges Passwort");
            }

            seller.ChangePassword(passwordHasher.Hash(command.NewPassword));
            await sellers.UpdateAsync(seller, ct);

            await refreshTokens.DeleteAllForSellerAsync(seller.Id, ct);

            var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
            var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
            var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairResult(accessToken, refreshPlainText);
        }, cancellationToken);

        return result!;
    }
}
