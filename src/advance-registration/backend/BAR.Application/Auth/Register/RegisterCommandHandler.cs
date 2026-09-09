using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;

namespace BAR.Application.Auth.Register;

public sealed class RegisterCommandHandler(
    ISellerRepository sellers,
    ISellerTypeRepository sellerTypes,
    ISettingsRepository settingsRepository,
    IRefreshTokenRepository refreshTokens,
    INumberBlockRepository blocks,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock)
{
    public async Task<TokenPairResult> HandleAsync(RegisterCommand command, CancellationToken cancellationToken)
    {
        // sellerTypes ist Teil der Konstruktor-Signatur (Interfaces-Liste des Tasks) fuer
        // Konsistenz mit Login/Refresh, wird in diesem Ablauf aber nicht gebraucht -
        // Register vertraut settings.DefaultTypeId ohne erneute Existenzpruefung.
        _ = sellerTypes;

        var settings = await settingsRepository.GetAsync(cancellationToken)
            ?? throw new ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");

        if (await sellers.GetByEmailAsync(command.Email, cancellationToken) is not null)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var passwordHash = passwordHasher.Hash(command.Password);
        var seller = Seller.Register(
            firstName: command.FirstName, lastName: command.LastName, address: command.Address,
            postalCode: command.PostalCode, city: command.City, phone: command.Phone,
            email: command.Email, sellerTypeId: settings.DefaultTypeId, passwordHash: passwordHash);

        await sellers.AddAsync(seller, cancellationToken);

        var existingBlocks = await blocks.GetAllOrderedByFromNumberAsync(cancellationToken);
        var newBlocks = NumberBlockAllocator.Allocate(
            existingBlocks, seller.Id, settings.DefaultBlockCount,
            settings.StartNumber, settings.BlockSize, clock.UtcNow);
        await blocks.AddRangeAsync(newBlocks, cancellationToken);

        var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
        var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
        var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
        await refreshTokens.AddAsync(refreshToken, cancellationToken);

        return new TokenPairResult(accessToken, refreshPlainText);
    }
}
