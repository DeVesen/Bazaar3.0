namespace Bazaar.Domain.Ports;

/// <summary>
/// Wraps a single atomic, retry-safe database transaction around
/// <paramref name="action"/>. Needed only by the app's Transaktions-Vorgänge
/// (api/cross-cutting.md: intake/release/sales/settlement/import) — most
/// handlers write through a single repository call and need no explicit
/// transaction. See Bazaar.Infrastructure/Persistence/README.md for why the
/// CreateExecutionStrategy detour is required (EnableRetryOnFailure).
/// </summary>
public interface IUnitOfWork
{
    Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken = default);
}
