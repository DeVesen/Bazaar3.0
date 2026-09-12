using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Auth.Login;

public sealed class LoginCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock)
{
    private const string InvalidCredentialsMessage = "Ungültige Anmeldedaten";

    /// <summary>
    /// A fixed BCrypt hash with no matching password. It is only verified so
    /// that an unknown email consumes the same compute time as a real match
    /// (Epic_Login AC-2) - not a constant-time login, but the measurable gap
    /// becomes narrow enough that DB/network jitter dominates it.
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
