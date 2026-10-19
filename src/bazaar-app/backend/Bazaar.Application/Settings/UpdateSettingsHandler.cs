using Bazaar.Domain.Ports;

namespace Bazaar.Application.Settings;

public sealed class UpdateSettingsHandler(ISettingsRepository settingsRepository)
{
    public async Task Handle(UpdateSettingsCommand command)
    {
        var settings = await settingsRepository.Get();
        settings.Update(command.ScannerPauseMs, command.ReleaseOnClose);
        await settingsRepository.Update(settings);
    }
}
