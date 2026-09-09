using BAR.Domain.Exceptions;
using BAR.Domain.Ports;

namespace BAR.Application.SellerTypes.Delete;

public sealed class DeleteSellerTypeCommandHandler(ISellerTypeRepository sellerTypes, ISettingsRepository settingsRepository)
{
    public async Task HandleAsync(string id, CancellationToken cancellationToken)
    {
        var type = await sellerTypes.GetByIdAsync(id, cancellationToken)
            ?? throw new NotFoundException("seller_type.not_found", "Verkäufer-Typ wurde nicht gefunden");

        var sellerCount = await sellerTypes.CountSellersAsync(id, cancellationToken);
        if (sellerCount > 0)
        {
            throw new ConflictException("seller_type.in_use", "Verkäufer-Typ wird noch verwendet");
        }

        var settings = await settingsRepository.GetAsync(cancellationToken);
        if (settings is not null && settings.DefaultTypeId == id)
        {
            throw new ConflictException("seller_type.is_default", "Kann nicht gelöscht werden — ist aktuell Standard-Typ in den Einstellungen");
        }

        await sellerTypes.DeleteAsync(type, cancellationToken);
    }
}
