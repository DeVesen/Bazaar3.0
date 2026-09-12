using BAR.Modules.Operations.Application.PublicInfo;
using BAR.Modules.Operations.Application.Settings.GetSettings;
using BAR.Modules.Operations.Application.Settings.Update;
using BAR.Modules.Operations.Contracts;
using BAR.Modules.Operations.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.Operations.Application;

/// <summary>
/// See BAR.Modules.Registration.Application.RegistrationModuleApi for the
/// rationale behind resolving handlers via <see cref="IServiceProvider"/>
/// instead of constructor injection (a bidirectional Contracts dependency on
/// MasterData and Registration would otherwise create a DI construction cycle).
/// </summary>
public sealed class OperationsModuleApi(IServiceProvider serviceProvider, ISettingsRepository settingsRepository) : IOperationsModuleApi
{
    private T Resolve<T>() where T : notnull => serviceProvider.GetRequiredService<T>();

    public Task<SettingsDto?> GetSettingsAsync(CancellationToken cancellationToken) =>
        Resolve<GetSettingsQueryHandler>().HandleAsync(cancellationToken);

    public Task<SettingsDto> UpdateSettingsAsync(UpdateSettingsCommand command, CancellationToken cancellationToken) =>
        Resolve<UpdateSettingsCommandHandler>().HandleAsync(command, cancellationToken);

    public Task<PublicInfoDto> GetPublicInfoAsync(CancellationToken cancellationToken) =>
        Resolve<GetPublicInfoQueryHandler>().HandleAsync(cancellationToken);

    public async Task<NumberingConfigDto> GetNumberingConfigAsync(CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken);
        return settings is null
            ? throw new InvalidOperationException("Einstellungen wurden noch nicht angelegt.")
            : new NumberingConfigDto(settings.StartNumber, settings.BlockSize, settings.DefaultBlockCount);
    }

    public async Task<BazaarScheduleDto?> GetBazaarScheduleAsync(CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken);
        return settings is null ? null : new BazaarScheduleDto(settings.BazaarFrom, settings.BazaarUntil);
    }

    public async Task<bool> IsDefaultSellerTypeAsync(string sellerTypeId, CancellationToken cancellationToken)
    {
        var settings = await settingsRepository.GetAsync(cancellationToken);
        return settings?.DefaultTypeId == sellerTypeId;
    }
}
