using BAR.Modules.Betrieb.Application.PublicInfo;
using BAR.Modules.Betrieb.Application.Settings.GetSettings;
using BAR.Modules.Betrieb.Application.Settings.Update;
using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Betrieb.Domain.Ports;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Modules.Betrieb.Application;

/// <summary>
/// Siehe BAR.Modules.Anmeldung.Application.AnmeldungModuleApi fuer die
/// Begruendung der Handler-Aufloesung ueber <see cref="IServiceProvider"/>
/// statt Konstruktor-Injektion (bidirektionale Contracts-Abhaengigkeit zu
/// Stammdaten und Anmeldung wuerde sonst einen DI-Konstruktionszyklus erzeugen).
/// </summary>
public sealed class BetriebModuleApi(IServiceProvider serviceProvider, ISettingsRepository settingsRepository) : IBetriebModuleApi
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
