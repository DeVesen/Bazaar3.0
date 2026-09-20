using Bazaar.Domain.Ports;

namespace Bazaar.Application.Settings;

public sealed record SettingsResponse(int ScannerPauseMs);

public sealed class GetSettingsHandler(ISettingsRepository settingsRepository)
{
    public async Task<SettingsResponse> Handle()
    {
        var settings = await settingsRepository.Get();
        return new SettingsResponse(settings.ScannerPauseMs);
    }
}
