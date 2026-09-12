using BAR.Modules.Operations.Contracts;
using BAR.Modules.Operations.Domain.Ports;
using BAR.Modules.MasterData.Contracts;

namespace BAR.Modules.Operations.Application.PublicInfo;

public sealed class GetPublicInfoQueryHandler(ISettingsRepository settingsRepository, IMasterDataModuleApi masterData)
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
            : await masterData.GetSellerTypeConditionsAsync(settings.DefaultTypeId, cancellationToken);

        return new PublicInfoDto(
            settings.RegistrationDeadline, settings.DropOffFrom, settings.DropOffUntil,
            settings.BazaarFrom, settings.BazaarUntil,
            conditions is null ? null : new ConditionsDto(conditions.CommissionRate, conditions.ItemFee),
            settings.InfoText);
    }
}
