using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;

namespace BAR.Application.SellerTypes.Create;

public sealed class CreateSellerTypeCommandHandler(ISellerTypeRepository sellerTypes)
{
    public async Task<SellerTypeResult> HandleAsync(CreateSellerTypeCommand command, CancellationToken cancellationToken)
    {
        if (await sellerTypes.ExistsByNameAsync(command.Name, excludeId: null, cancellationToken))
        {
            throw new ConflictException("seller_type.name_taken", "Ein Verkäufer-Typ mit dieser Bezeichnung existiert bereits");
        }

        var type = SellerType.Create(command.Name, command.CommissionRate, command.ItemFee);
        await sellerTypes.AddAsync(type, cancellationToken);

        return new SellerTypeResult(type.Id, type.Name, type.CommissionRate, type.ItemFee, SellerCount: 0);
    }
}
