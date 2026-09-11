namespace BAR.SharedKernel.Events;

/// <summary>
/// Die Verbindungsstelle zwischen Modulen fuer Ereignis-Kopplung
/// (modulith-thinking: "Verbindungsstelle" - jede Abteilung reagiert
/// selbstaendig, niemand steuert zentral). Synchroner In-Process-Dispatch
/// nach SaveChanges genuegt innerhalb eines Modulithen
/// (architecture-styles/references/data-flow.md, "Event-Driven Integration").
/// </summary>
public interface IDomainEventDispatcher
{
    Task DispatchAsync(IDomainEvent domainEvent, CancellationToken cancellationToken);
}
