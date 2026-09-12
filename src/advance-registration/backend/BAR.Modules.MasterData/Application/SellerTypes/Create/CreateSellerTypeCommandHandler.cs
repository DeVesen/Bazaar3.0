using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.MasterData.Domain.SellerTypes;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.MasterData.Application.SellerTypes.Create;

public sealed class CreateSellerTypeCommandHandler(ISellerTypeRepository sellerTypes)
{
    public async Task<SellerTypeDto> HandleAsync(CreateSellerTypeCommand command, CancellationToken cancellationToken)
    {
        if (await sellerTypes.ExistsByNameAsync(command.Name, excludeId: null, cancellationToken))
        {
            throw new ConflictException("seller_type.name_taken", "Ein Verkäufer-Typ mit dieser Bezeichnung existiert bereits");
        }

        var type = SellerType.Create(command.Name, command.CommissionRate, command.ItemFee);
        await sellerTypes.AddAsync(type, cancellationToken);

        return new SellerTypeDto(type.Id, type.Name, type.CommissionRate, type.ItemFee, SellerCount: 0);
    }
}
