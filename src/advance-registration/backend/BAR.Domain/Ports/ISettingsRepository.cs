namespace BAR.Domain.Ports;

public interface ISettingsRepository
{
    Task<BAR.Domain.Settings.Settings?> GetAsync(CancellationToken cancellationToken);
    Task SaveAsync(BAR.Domain.Settings.Settings settings, CancellationToken cancellationToken);
}
