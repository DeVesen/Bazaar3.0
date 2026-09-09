using BAR.Application.Abstractions;
using Microsoft.EntityFrameworkCore;

namespace BAR.Infrastructure.Persistence;

/// <summary>
/// Transaktionsklammer auf Basis des scoped <see cref="BarDbContext"/>. Weil
/// alle Repositories eines Requests dieselbe DbContext-Instanz teilen, fliessen
/// deren interne <c>SaveChanges</c>-Aufrufe in die hier geoeffnete Transaktion
/// und werden erst mit <c>CommitAsync</c> sichtbar.
/// </summary>
/// <remarks>
/// Der Umweg ueber <c>CreateExecutionStrategy</c> ist Pflicht, nicht Stilfrage:
/// die Verbindung ist mit <c>EnableRetryOnFailure(3)</c> konfiguriert, und EF
/// Core wirft zur Laufzeit, wenn eine manuelle Transaktion ausserhalb der
/// Execution-Strategy geoeffnet wird (ein Retry duerfte sonst nur einen Teil
/// der Arbeit wiederholen).
/// </remarks>
public sealed class EfUnitOfWork(BarDbContext dbContext) : IUnitOfWork
{
    public async Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken)
    {
        var strategy = dbContext.Database.CreateExecutionStrategy();
        await strategy.ExecuteAsync(async () =>
        {
            // Bei Retry (transiente Verbindungsstoerung) haelt der ChangeTracker
            // noch Entities aus dem ersten, zurueckgerollten Versuch als Added/
            // Modified fest. Ohne Clear() sendet SaveChanges beim Retry sowohl
            // die alten als auch die neu erzeugten Entities - z.B. zwei Seller
            // mit derselben E-Mail, was als 23505 faelschlich "email_taken" meldet.
            dbContext.ChangeTracker.Clear();
            await using var transaction = await dbContext.Database.BeginTransactionAsync(cancellationToken);
            await action(cancellationToken);
            await transaction.CommitAsync(cancellationToken);
        });
    }
}
