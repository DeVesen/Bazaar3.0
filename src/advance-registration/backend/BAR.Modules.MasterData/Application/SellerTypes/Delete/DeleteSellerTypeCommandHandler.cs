using BAR.Modules.Operations.Contracts;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.SellerManagement.Contracts;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.MasterData.Application.SellerTypes.Delete;

public sealed class DeleteSellerTypeCommandHandler(
    ISellerTypeRepository sellerTypes,
    ISellerManagementModuleApi sellerManagement,
    IOperationsModuleApi operations)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var type = await sellerTypes.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkäufer-Typ wurde nicht gefunden");

        var sellerCount = await sellerManagement.CountSellersByTypeAsync(id, cancellationToken);
        if (sellerCount > 0)
        {
            throw new ConflictException("seller_type.in_use", "Verkäufer-Typ wird noch verwendet");
        }

        if (await operations.IsDefaultSellerTypeAsync(id, cancellationToken))
        {
            throw new ConflictException("seller_type.is_default", "Kann nicht gelöscht werden — ist aktuell Standard-Typ in den Einstellungen");
        }

        await sellerTypes.DeleteAsync(type, cancellationToken);
    }
}
