using BAR.Domain.Ports;

namespace BAR.Application.Settings.GetSettings;

public sealed class GetSettingsQueryHandler(ISettingsRepository settingsRepository)
{
    public async Task<SettingsResult> HandleAsync(CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken);

        return settings is null
            ? new SettingsResult(null, null, null, null, null, null, null, null, null, null)
            : new SettingsResult(
                settings.RegistrationDeadline, settings.DropOffFrom, settings.DropOffUntil,
                settings.BazaarFrom, settings.BazaarUntil, settings.DefaultTypeId, settings.InfoText,
                settings.StartNumber, settings.BlockSize, settings.DefaultBlockCount);
    }
}
