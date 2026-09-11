using BAR.Modules.Stammdaten.Contracts;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Sellers;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Create;

public sealed class CreateSellerCommandHandler(
    ISellerRepository sellers, IStammdatenModuleApi stammdaten, SellerBlockAllocationCoordinator blockCoordinator)
{
    public async Task<SellerDto> HandleAsync(CreateSellerCommand command, CancellationToken cancellationToken)
    {
        var conditions = await stammdaten.GetSellerTypeConditionsAsync(command.SellerTypeId, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Unbekannter Verkäufer-Typ");

        if (await sellers.GetByEmailAsync(command.Email, cancellationToken) is not null)
        {
            throw new ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert");
        }

        var seller = Seller.CreateByAdmin(
            command.FirstName, command.LastName, command.Address, command.PostalCode,
            command.City, command.Phone, command.Email, command.SellerTypeId, command.IsAdmin);

        await sellers.AddAsync(seller, cancellationToken);

        // Ausserhalb der Seller-Anlage: Nummernbloecke liegen im Modul
        // Anmeldung (eigenes Schema) - siehe SellerBlockAllocationCoordinator.
        // Die vom Admin vorgegebene Startnummer wird dort gegen die
        // konfigurierte Basar-Startnummer geprueft (Pruef-Kaskade Stufe 1,
        // api/blocks.md Abschnitt 6).
        var newBlocks = await blockCoordinator.AllocateOrCompensateAsync(
            seller.Id, command.BlockCount, command.StartNumber, cancellationToken);

        return new SellerDto(
            seller.Id, newBlocks.Count > 0 ? newBlocks[0].FromNumber : null, seller.FirstName, seller.LastName,
            seller.Address, seller.PostalCode, seller.City, seller.Phone, seller.Email, seller.SellerTypeId,
            new SellerTypeSummaryDto(conditions.SellerTypeId, conditions.Name, conditions.CommissionRate, conditions.ItemFee),
            seller.IsAdmin, 0, false);
    }
}
