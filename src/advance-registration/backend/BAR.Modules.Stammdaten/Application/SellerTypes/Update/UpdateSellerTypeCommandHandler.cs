using BAR.Modules.Stammdaten.Contracts.SellerTypes;
using BAR.Modules.Stammdaten.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Contracts;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Stammdaten.Application.SellerTypes.Update;

public sealed class UpdateSellerTypeCommandHandler(ISellerTypeRepository sellerTypes, IVerkaeuferverwaltungModuleApi verkaeuferverwaltung)
{
    public async Task<SellerTypeDto> HandleAsync(string id, UpdateSellerTypeCommand command, CancellationToken cancellationToken)
    {
        var type = await sellerTypes.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkäufer-Typ wurde nicht gefunden");

        if (await sellerTypes.ExistsByNameAsync(command.Name, id, cancellationToken))
        {
            throw new ConflictException("seller_type.name_taken", "Ein Verkäufer-Typ mit dieser Bezeichnung existiert bereits");
        }

        type.Update(command.Name, command.CommissionRate, command.ItemFee);
        await sellerTypes.UpdateAsync(type, cancellationToken);

        // Seller lebt im Modul Verkaeuferverwaltung (eigenes Schema).
        var sellerCount = await verkaeuferverwaltung.CountSellersByTypeAsync(id, cancellationToken);
        return new SellerTypeDto(type.Id, type.Name, type.CommissionRate, type.ItemFee, sellerCount);
    }
}
