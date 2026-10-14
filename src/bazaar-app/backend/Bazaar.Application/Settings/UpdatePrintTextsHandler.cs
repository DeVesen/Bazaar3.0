using Bazaar.Domain.Ports;

namespace Bazaar.Application.Settings;

public sealed class UpdatePrintTextsHandler(ISettingsRepository settingsRepository)
{
    public async Task Handle(UpdatePrintTextsCommand command)
    {
        var settings = await settingsRepository.Get();
        settings.UpdatePrintTexts(command.AbgabeBeleg.ToDomain(), command.VerkaeuferUebersicht.ToDomain());
        await settingsRepository.Update(settings);
    }
}
