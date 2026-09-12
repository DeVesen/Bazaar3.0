using BAR.SharedKernel;
using Microsoft.EntityFrameworkCore;

namespace BAR.Modules.SellerManagement.Infrastructure.Persistence;

/// <summary>
/// A transaction wrapper built on the scoped <see cref="SellerManagementDbContext"/>.
/// See BAR.Modules.MasterData for the same rationale behind the
/// CreateExecutionStrategy detour (EnableRetryOnFailure).
/// </summary>
public sealed class EfUnitOfWork(SellerManagementDbContext dbContext) : IUnitOfWork
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
