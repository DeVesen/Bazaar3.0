namespace BAR.SharedKernel.Events;

/// <summary>
/// The connecting point between modules for event coupling
/// (modulith-thinking: "connecting point" - every department reacts on its
/// own, nobody controls this centrally). A synchronous in-process dispatch
/// after SaveChanges is sufficient within a modulith
/// (architecture-styles/references/data-flow.md, "Event-Driven Integration").
/// </summary>
public interface IDomainEventDispatcher
{
    Task DispatchAsync(IDomainEvent domainEvent, CancellationToken cancellationToken);
}
