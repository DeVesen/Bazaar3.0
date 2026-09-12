namespace BAR.SharedKernel;

/// <summary>
/// A transaction wrapper around several repository calls within one module.
/// Every repository method calls <c>SaveChanges</c> internally - without this
/// wrapper, multiple calls from one handler would be multiple independent
/// commits, and a failure in the second step would leave the first
/// permanently in the database.
/// </summary>
/// <remarks>
/// The interface is module-independent and therefore lives in the
/// SharedKernel; every module brings its own implementation (bound to its
/// own DbContext, see dotnet-modulith-bridge - its own schema per module). A
/// transaction never spans two modules: if an operation writes to two
/// modules, that is a call plus a compensation, never a shared DB transaction.
/// </remarks>
public interface IUnitOfWork
{
    Task ExecuteInTransactionAsync(Func<CancellationToken, Task> action, CancellationToken cancellationToken);
}
