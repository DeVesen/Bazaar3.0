using BAR.Application.Abstractions;
using BAR.Domain.Exceptions;
using BAR.Domain.NumberBlocks;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;

namespace BAR.Application.Sellers.Create;

public sealed class CreateSellerCommandHandler(
    ISellerRepository sellers,
    ISettingsRepository settingsRepository,
    INumberBlockRepository blocks,
    ISellerTypeRepository sellerTypes,
    IUnitOfWork unitOfWork)
{
    public async Task<SellerResponse> HandleAsync(CreateSellerCommand command, CancellationToken cancellationToken)
    {
        SellerResponse? result = null;

        // Verkaeufer-Anlage und Nummernblock-Vergabe sind ein einziger fachlicher
        // Vorgang. Ohne diese Klammer koennte ein Fehler bei der Bloecke-Vergabe
        // (z. B. EXCLUDE-Constraint bei gleichzeitiger Registrierung/Anlage) einen
        // dauerhaft verwaisten Verkaeufer ohne Nummernbloecke zuruecklassen.
        await unitOfWork.ExecuteInTransactionAsync(async ct =>
        {
            var sellerType = await sellerTypes.GetByIdAsync(command.SellerTypeId, ct)
                ?? throw new NotFoundException("seller_type.not_found", "Unbekannter Verkäufer-Typ");

            if (await sellers.GetByEmailAsync(command.Email, ct) is not null)
            {
                throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
            }

            var settings = await settingsRepository.GetAsync(ct)
                ?? throw new ConflictException("registration.not_enabled", "Registrierung ist noch nicht freigeschaltet");

            var seller = Seller.CreateByAdmin(
                command.FirstName, command.LastName, command.Address, command.PostalCode,
                command.City, command.Phone, command.Email, command.SellerTypeId, command.IsAdmin);

            await sellers.AddAsync(seller, ct);

            var newBlocks = await AllocateBlocksWithOneRetryAsync(seller.Id, command, settings, ct);

            result = new SellerResponse(
                seller.Id, newBlocks.Count > 0 ? newBlocks[0].FromNumber : null, seller.FirstName, seller.LastName,
                seller.Address, seller.PostalCode, seller.City, seller.Phone, seller.Email, seller.SellerTypeId,
                new SellerTypeSummary(sellerType.Id, sellerType.Name, sellerType.CommissionRate, sellerType.ItemFee),
                seller.IsAdmin, 0, false);
        }, cancellationToken);

        return result!;
    }

    /// <summary>
    /// Berechnet den freien Bereich und legt ihn an. Zwei gleichzeitige Anlagen
    /// (z. B. dieser Endpoint und POST /api/auth/register) koennen denselben
    /// Bereich berechnen - der zweite Versuch laeuft dann in das
    /// EXCLUDE-Constraint. Genau dieser Fall wird einmal wiederholt (mit frisch
    /// gelesenem Bestand); scheitert auch das, bleibt es bei einem sauberen 409
    /// statt eines rohen 500.
    /// </summary>
    private async Task<IReadOnlyList<NumberBlock>> AllocateBlocksWithOneRetryAsync(
        string sellerId, CreateSellerCommand command, Domain.Settings.Settings settings, CancellationToken ct)
    {
        try
        {
            return await AllocateAndInsertAsync(sellerId, command, settings, ct);
        }
        catch (NumberBlockOverlapException)
        {
            try
            {
                return await AllocateAndInsertAsync(sellerId, command, settings, ct);
            }
            catch (NumberBlockOverlapException)
            {
                throw new ConflictException(
                    "block.overlap",
                    "Nummernvergabe momentan ueberlastet, bitte erneut versuchen");
            }
        }
    }

    private async Task<IReadOnlyList<NumberBlock>> AllocateAndInsertAsync(
        string sellerId, CreateSellerCommand command, Domain.Settings.Settings settings, CancellationToken ct)
    {
        var existingBlocks = await blocks.GetAllOrderedByFromNumberAsync(ct);
        var newBlocks = NumberBlockAllocator.Allocate(
            existingBlocks, sellerId, command.BlockCount ?? settings.DefaultBlockCount,
            command.StartNumber ?? settings.StartNumber, settings.BlockSize, DateTime.UtcNow);
        await blocks.AddRangeAsync(newBlocks, ct);
        return newBlocks;
    }
}
