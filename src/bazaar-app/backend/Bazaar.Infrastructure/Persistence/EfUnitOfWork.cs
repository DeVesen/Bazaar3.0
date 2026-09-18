using Bazaar.Domain.Ports;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.Persistence;

/// <summary>
/// A transaction wrapper built on the scoped <see cref="BazaarDbContext"/>.
/// Mirrors src/advance-registration/backend/BAR.Modules.SellerManagement's
/// EfUnitOfWork — same CreateExecutionStrategy rationale (EnableRetryOnFailure).
/// </summary>
public sealed class EfUnitOfWork(BazaarDbContext dbContext) : IUnitOfWork
{
    public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default)
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
