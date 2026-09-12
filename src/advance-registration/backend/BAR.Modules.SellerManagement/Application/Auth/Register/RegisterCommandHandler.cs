using BAR.Modules.Operations.Contracts;
using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Application.Sellers;
using BAR.Modules.SellerManagement.Contracts;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Application.Auth.Register;

public sealed class RegisterCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IOperationsModuleApi operations,
    SellerBlockAllocationCoordinator blockCoordinator,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock,
    IUnitOfWork unitOfWork)
{
    public async Task<TokenPairDto> HandleAsync(RegisterCommand command, CancellationToken cancellationToken)
    {
        var settings = await operations.GetSettingsAsync(cancellationToken);
        if (settings?.DefaultTypeId is null)
        {
            throw new ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");
        }

        if (await sellers.GetByEmailAsync(command.Email, cancellationToken) is not null)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var passwordHash = passwordHasher.Hash(command.Password);
        var seller = Seller.Register(
            firstName: command.FirstName, lastName: command.LastName, address: command.Address,
            postalCode: command.PostalCode, city: command.City, phone: command.Phone,
            email: command.Email, sellerTypeId: settings.DefaultTypeId, passwordHash: passwordHash);

        TokenPairDto? result = null;

        // Seller and refresh token are a single business transaction - both
        // live in this module/schema, the transaction prevents a seller
        // without any session.
        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            await sellers.AddAsync(seller, ct);

            var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
            var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
            var refreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairDto(accessToken, refreshPlainText);
        }, cancellationToken);

        // Number blocks live in the Registration module (own schema) - see
        // SellerBlockAllocationCoordinator for the compensation logic.
        await blockCoordinator.AllocateOrCompensateAsync(seller.Id, blockCount: null, startNumber: null, cancellationToken);

        return result!;
    }
}
