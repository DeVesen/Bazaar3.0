using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;

namespace BAR.Application.Auth.Register;

public sealed class RegisterCommandHandler(
    ISellerRepository sellers,
    ISettingsRepository settingsRepository,
    IRefreshTokenRepository refreshTokens,
    INumberBlockRepository blocks,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer,
    IClock clock,
    IUnitOfWork unitOfWork)
{
    public async Task<TokenPairResult> HandleAsync(RegisterCommand command, CancellationToken cancellationToken)
    {
        TokenPairResult? result = null;

        // Verkaeufer, Nummernbloecke und Refresh-Token sind ein einziger
        // fachlicher Vorgang. Ohne diese Klammer waeren es drei Commits, und ein
        // Fehler beim Bloecke-Einfuegen liesse einen Verkaeufer ohne Nummern und
        // ohne Session zurueck - in R01 gibt es dafuer keine Selbstheilung
        // (Passwort-Reset ist Admin-Sache), die E-Mail waere verbrannt.
        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var settings = await settingsRepository.GetAsync(ct)
                ?? throw new ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");

            if (settings.DefaultTypeId is null)
            {
                throw new ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");
            }

            if (await sellers.GetByEmailAsync(command.Email, ct) is not null)
            {
                throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
            }

            var passwordHash = passwordHasher.Hash(command.Password);
            var seller = Seller.Register(
                firstName: command.FirstName, lastName: command.LastName, address: command.Address,
                postalCode: command.PostalCode, city: command.City, phone: command.Phone,
                email: command.Email, sellerTypeId: settings.DefaultTypeId, passwordHash: passwordHash);

            await sellers.AddAsync(seller, ct);

            await AllocateBlocksWithOneRetryAsync(seller.Id, settings, ct);

            var accessToken = tokenIssuer.IssueAccessToken(seller.Id, seller.IsAdmin ? "admin" : "seller", clock.UtcNow);
            var refreshPlainText = tokenIssuer.GenerateRefreshTokenPlainText();
            var refreshToken = BAR.Domain.Auth.RefreshToken.Issue(seller.Id, refreshPlainText, clock.UtcNow, clock.UtcNow.AddDays(30));
            await refreshTokens.AddAsync(refreshToken, ct);

            result = new TokenPairResult(accessToken, refreshPlainText);
        }, cancellationToken);

        return result!;
    }

    /// <summary>
    /// Berechnet den freien Bereich und legt ihn an. Zwei gleichzeitige
    /// Registrierungen koennen denselben Bereich berechnen - der zweite Versuch
    /// laeuft dann in das EXCLUDE-Constraint. Genau dieser Fall wird einmal
    /// wiederholt (mit frisch gelesenem Bestand); scheitert auch das, bleibt es
    /// bei einem sauberen 409 statt eines rohen 500.
    /// </summary>
    private async Task AllocateBlocksWithOneRetryAsync(
        string sellerId, Domain.Settings.Settings settings, CancellationToken ct)
    {
        try
        {
            await AllocateAndInsertAsync(sellerId, settings, ct);
        }
        catch (NumberBlockOverlapException)
        {
            try
            {
                await AllocateAndInsertAsync(sellerId, settings, ct);
            }
            catch (NumberBlockOverlapException)
            {
                throw new ConflictException(
                    "block.overlap",
                    "Nummernvergabe momentan ueberlastet, bitte erneut versuchen");
            }
        }
    }

    private async Task AllocateAndInsertAsync(
        string sellerId, Domain.Settings.Settings settings, CancellationToken ct)
    {
        var existingBlocks = await blocks.GetAllOrderedByFromNumberAsync(ct);
        var newBlocks = NumberBlockAllocator.Allocate(
            existingBlocks, sellerId, settings.DefaultBlockCount,
            settings.StartNumber, settings.BlockSize, clock.UtcNow);
        await blocks.AddRangeAsync(newBlocks, ct);
    }
}
