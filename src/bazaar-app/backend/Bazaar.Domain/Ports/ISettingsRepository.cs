namespace Bazaar.Domain.Ports;

public interface ISettingsRepository
{
    Task<Bazaar.Domain.Settings.Settings> Get();

    Task Update(Bazaar.Domain.Settings.Settings settings);
}
