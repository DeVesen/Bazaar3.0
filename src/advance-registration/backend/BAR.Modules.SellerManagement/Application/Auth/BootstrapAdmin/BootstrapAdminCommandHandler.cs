using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;

/// <summary>
/// Creates the very first admin on an otherwise empty system and logs them
/// in immediately - the counterpart to the hardcoded migration seed this
/// replaces. Reuses <see cref="RegisterCommand"/>/its validator (same form
/// fields as normal self-registration) since only the resulting role and
/// the seller-type placeholder differ from <see cref="Register.RegisterCommandHandler"/>.
/// </summary>
public sealed class BootstrapAdminCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock,
    IUnitOfWork unitOfWork,
    AdminBootstrapState bootstrapState)
{
    /// <summary>An admin has no commercial seller type - this placeholder is
    /// the same value the old hardcoded migration seed used, seeded once by
    /// MasterData.InitialCreate.</summary>
    private const string BootstrapSellerTypeId = "t0000001";

    public async Task<TokenPairDto> HandleAsync(RegisterCommand command, CancellationToken cancellationToken)
    {
        if (bootstrapState.HasAdmin)
        {
            throw new ConflictException("bootstrap.already_done", "Es existiert bereits ein Administrator-Konto");
        }

        if (await sellers.GetByEmailAsync(command.Email, cancellationToken) is not null)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var passwordHash = passwordHasher.Hash(command.Password);
        var seller = Seller.Register(
            firstName: command.FirstName, lastName: command.LastName, address: command.Address,
            postalCode: command.PostalCode, city: command.City, phone: command.Phone,
            email: command.Email, sellerTypeId: BootstrapSellerTypeId, passwordHash: passwordHash, isAdmin: true);

        TokenPairDto? result = null;

        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            await sellers.AddAsync(seller, ct);

            var accessToken = tokenIssuer.IssueAccessToken(seller.Id, "admin", clock.UtcNow);
            var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
            var refreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairDto(accessToken, refreshPlainText);
        }, cancellationToken);

        bootstrapState.MarkAdminCreated();

        return result!;
    }
}
