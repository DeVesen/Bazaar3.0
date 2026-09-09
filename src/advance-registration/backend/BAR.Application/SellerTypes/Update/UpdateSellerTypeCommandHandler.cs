using BAR.Application.SellerTypes;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.SellerTypes.Update;

public sealed class UpdateSellerTypeCommandHandler(ISellerTypeRepository sellerTypes)
{
    public async Task<SellerTypeResult> HandleAsync(string id, UpdateSellerTypeCommand command, CancellationToken cancellationToken)
    {
        var type = await sellerTypes.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkäufer-Typ wurde nicht gefunden");

        if (await sellerTypes.ExistsByNameAsync(command.Name, id, cancellationToken))
        {
            throw new ConflictException("seller_type.name_taken", "Ein Verkäufer-Typ mit dieser Bezeichnung existiert bereits");
        }

        type.Update(command.Name, command.CommissionRate, command.ItemFee);
        await sellerTypes.UpdateAsync(type, cancellationToken);

        var sellerCount = await sellerTypes.CountSellersAsync(id, cancellationToken);
        return new SellerTypeResult(type.Id, type.Name, type.CommissionRate, type.ItemFee, sellerCount);
    }
}
