using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Profile;
using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Profile.ChangePassword;

public sealed class ChangePasswordCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock,
    IUnitOfWork unitOfWork)
{
    public async Task<TokenPairDto> HandleAsync(string sellerId, ChangePasswordCommand command, CancellationToken cancellationToken)
    {
        TokenPairDto? result = null;

        // Changing the password, signing out all devices, and issuing the new
        // token pair are one single business operation (R07 AC-3) - otherwise
        // a failure after deleting the old tokens could leave the calling
        // device without any valid token at all.
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
            var refreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairDto(accessToken, refreshPlainText);
        }, cancellationToken);

        return result!;
    }
}
