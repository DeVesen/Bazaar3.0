using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;
using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Infrastructure.Persistence.Repositories;

public sealed class SettingsRepository(BazaarDbContext dbContext) : ISettingsRepository
{
    public Task<SettingsAggregate> Get() =>
        dbContext.Settings.SingleAsync(s => s.Id == SettingsAggregate.FixedId);

    public async Task Update(SettingsAggregate settings)
    {
        dbContext.Settings.Update(settings);
        await dbContext.SaveChangesAsync();
    }
}
