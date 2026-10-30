using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Settings;

public sealed class UpdateSettingsHandler(ISettingsRepository settingsRepository, ISellerTypeRepository sellerTypeRepository)
{
    public async Task Handle(UpdateSettingsCommand command)
    {
        if (!string.IsNullOrWhiteSpace(command.DefaultSellerTypeId)
            && await sellerTypeRepository.GetById(command.DefaultSellerTypeId) is null)
        {
            throw new NotFoundException("Verkäufer-Typ nicht gefunden", "seller_type.not_found");
        }

        var settings = await settingsRepository.Get();
        settings.Update(command.ScannerPauseMs, command.ReleaseOnClose);
        settings.ChangeDefaultSellerType(command.DefaultSellerTypeId);
        await settingsRepository.Update(settings);
    }
}
