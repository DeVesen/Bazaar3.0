using BAR.Modules.Operations.Domain;

namespace BAR.Modules.Operations.Domain.Ports;

public interface ISettingsRepository
{
    Task<Settings?> GetAsync(CancellationToken cancellationToken);
    Task SaveAsync(Settings settings, CancellationToken cancellationToken);
}
