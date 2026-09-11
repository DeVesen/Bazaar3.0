using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Application.Abstractions;
using BAR.Modules.Verkaeuferverwaltung.Application.Sellers;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Auth;
using BAR.Modules.Verkaeuferverwaltung.Domain.Auth;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Auth.Register;

public sealed class RegisterCommandHandler(
    ISellerRepository sellers,
    IRefreshTokenRepository refreshTokens,
    IBetriebModuleApi betrieb,
    SellerBlockAllocationCoordinator blockCoordinator,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock,
    IUnitOfWork unitOfWork)
{
    public async Task<TokenPairDto> HandleAsync(RegisterCommand command, CancellationToken cancellationToken)
    {
        var settings = await betrieb.GetSettingsAsync(cancellationToken);
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

        // Verkaeufer und Refresh-Token sind ein einziger fachlicher Vorgang -
        // beide leben in diesem Modul/Schema, die Klammer verhindert einen
        // Verkaeufer ohne jede Session.
        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            await sellers.AddAsync(seller, ct);

            var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
            var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
            var refreshToken = RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairDto(accessToken, refreshPlainText);
        }, cancellationToken);

        // Nummernbloecke liegen im Modul Anmeldung (eigenes Schema) - siehe
        // SellerBlockAllocationCoordinator fuer die Kompensationslogik.
        await blockCoordinator.AllocateOrCompensateAsync(seller.Id, blockCount: null, startNumber: null, cancellationToken);

        return result!;
    }
}
