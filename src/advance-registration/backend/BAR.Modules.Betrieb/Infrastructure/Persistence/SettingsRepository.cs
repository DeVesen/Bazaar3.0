using BAR.Modules.Betrieb.Domain;
using BAR.Modules.Betrieb.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Betrieb.Infrastructure.Persistence;

public sealed class SettingsRepository(BetriebDbContext dbContext) : ISettingsRepository
{
    public Task<Settings?> GetAsync(CancellationToken cancellationToken) =>
        dbContext.Settings.SingleOrDefaultAsync(cancellationToken);

    public async Task SaveAsync(Settings settings, CancellationToken cancellationToken)
    {
        var exists = await dbContext.Settings.AnyAsync(s => s.Id == settings.Id, cancellationToken);
        if (exists)
        {
            dbContext.Settings.Update(settings);
        }
        else
        {
            dbContext.Settings.Add(settings);
        }

        await dbContext.SaveChangesAsync(cancellationToken);
    }
}
