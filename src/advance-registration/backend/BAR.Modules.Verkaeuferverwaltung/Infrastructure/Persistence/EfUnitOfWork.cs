using BAR.SharedKernel;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.Verkaeuferverwaltung.Infrastructure.Persistence;

/// <summary>
/// Transaktionsklammer auf Basis des scoped <see cref="VerkaeuferverwaltungDbContext"/>.
/// Siehe BAR.Modules.Stammdaten fuer dieselbe Begruendung des
/// CreateExecutionStrategy-Umwegs (EnableRetryOnFailure).
/// </summary>
public sealed class EfUnitOfWork(VerkaeuferverwaltungDbContext dbContext) : IUnitOfWork
{
    public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken)
    {
        var strategy = dbContext.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            dbContext.ChangeTracker.Clear();
            await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
            await action(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        });
    }
}
