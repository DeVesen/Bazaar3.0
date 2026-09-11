using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Betrieb.Domain.Ports;
using BAR.Modules.Stammdaten.Contracts;

namespace BAR.Modules.Betrieb.Application.PublicInfo;

public sealed class GetPublicInfoQueryHandler(ISettingsRepository settingsRepository, IStammdatenModuleApi stammdaten)
{
    public async Task<PublicInfoDto> HandleAsync(CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken);
        if (settings is null)
        {
            return new PublicInfoDto(null, null, null, null, null, null, null);
        }

        var conditions = settings.DefaultTypeId is null
            ? null
            : await stammdaten.GetSellerTypeConditionsAsync(settings.DefaultTypeId, cancellationToken);

        return new PublicInfoDto(
            settings.RegistrationDeadline, settings.DropOffFrom, settings.DropOffUntil,
            settings.BazaarFrom, settings.BazaarUntil,
            conditions is null ? null : new ConditionsDto(conditions.CommissionRate, conditions.ItemFee),
            settings.InfoText);
    }
}
