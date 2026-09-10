using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SettingsRepository(BarDbContext dbContext) : ISettingsRepository
{
    public Task<Domain.Settings.Settings?> GetAsync(CancellationToken cancellationToken) =>
        dbContext.Settings.SingleOrDefaultAsync(cancellationToken);

    public async Task SaveAsync(Domain.Settings.Settings settings, CancellationToken cancellationToken)
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
