using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.SellerManagement.Contracts;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.MasterData.Application.SellerTypes.Update;

public sealed class UpdateSellerTypeCommandHandler(ISellerTypeRepository sellerTypes, ISellerManagementModuleApi sellerManagement)
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

        // Seller lebt im Modul SellerManagement (eigenes Schema).
        var sellerCount = await sellerManagement.CountSellersByTypeAsync(id, cancellationToken);
        return new SellerTypeDto(type.Id, type.Name, type.CommissionRate, type.ItemFee, sellerCount);
    }
}
