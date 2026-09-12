using BAR.Modules.Operations.Domain;
using BAR.Modules.Operations.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Operations.Infrastructure.Persistence;

public sealed class SettingsRepository(OperationsDbContext dbContext) : ISettingsRepository
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
