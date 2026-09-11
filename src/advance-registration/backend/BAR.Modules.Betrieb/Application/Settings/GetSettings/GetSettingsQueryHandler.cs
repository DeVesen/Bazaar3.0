using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Betrieb.Domain.Ports;

namespace BAR.Modules.Betrieb.Application.Settings.GetSettings;

public sealed class GetSettingsQueryHandler(ISettingsRepository settingsRepository)
{
    public async Task<SettingsDto?> HandleAsync(CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken);
        return settings is null ? null : Map(settings);
    }

    internal static SettingsDto Map(Domain.Settings settings) => new(
        settings.RegistrationDeadline, settings.DropOffFrom, settings.DropOffUntil,
        settings.BazaarFrom, settings.BazaarUntil, settings.DefaultTypeId, settings.InfoText,
        settings.StartNumber, settings.BlockSize, settings.DefaultBlockCount);
}
