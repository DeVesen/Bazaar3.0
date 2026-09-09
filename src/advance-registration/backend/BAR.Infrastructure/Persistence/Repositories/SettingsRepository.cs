using BAR.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence.Repositories;

public sealed class SettingsRepository(BarDbContext dbContext) : ISettingsRepository
{
    public Task<Domain.Settings.Settings?> GetAsync(CancellationToken cancellationToken) =>
        dbContext.Settings.SingleOrDefaultAsync(cancellationToken);
}
