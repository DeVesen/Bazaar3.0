using Bazaar.Domain.Ports;

namespace Bazaar.Application.Settings;

public sealed class GetPrintTextsHandler(ISettingsRepository settingsRepository)
{
    public async Task<PrintTextsResponse> Handle()
    {
        var settings = await settingsRepository.Get();
        return new PrintTextsResponse(
            PrintTextsDto.From(settings.AbgabeBeleg),
            PrintTextsDto.From(settings.VerkaeuferUebersicht));
    }
}
