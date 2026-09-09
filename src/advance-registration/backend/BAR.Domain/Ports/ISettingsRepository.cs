namespace BAR.Domain.Ports;

public interface ISettingsRepository
{
    Task<BAR.Domain.Settings.Settings?> GetAsync(CancellationToken cancellationToken);
}
