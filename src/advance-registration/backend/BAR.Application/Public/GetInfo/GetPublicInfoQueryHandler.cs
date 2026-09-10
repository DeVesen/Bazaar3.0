using BAR.Domain.Ports;

namespace BAR.Application.Public.GetInfo;

public sealed class GetPublicInfoQueryHandler(ISettingsRepository settingsRepository, ISellerTypeRepository sellerTypes)
{
    public async Task<PublicInfoResult> HandleAsync(CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken);
        if (settings is null)
        {
            return new PublicInfoResult(null, null, null, null, null, null, null);
        }

        var defaultType = settings.DefaultTypeId is null
            ? null
            : await sellerTypes.GetByIdAsync(settings.DefaultTypeId, cancellationToken);
        var conditions = defaultType is null ? null : new ConditionsResult(defaultType.CommissionRate, defaultType.ItemFee);

        return new PublicInfoResult(
            settings.RegistrationDeadline, settings.DropOffFrom, settings.DropOffUntil,
            settings.BazaarFrom, settings.BazaarUntil, conditions, settings.InfoText);
    }
}
