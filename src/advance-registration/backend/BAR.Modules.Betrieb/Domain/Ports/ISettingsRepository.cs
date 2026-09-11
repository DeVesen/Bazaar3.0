using BAR.Modules.Betrieb.Domain;

namespace BAR.Modules.Betrieb.Domain.Ports;

public interface ISettingsRepository
{
    Task<Settings?> GetAsync(CancellationToken cancellationToken);
    Task SaveAsync(Settings settings, CancellationToken cancellationToken);
}
