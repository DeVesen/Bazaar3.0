namespace BAR.SharedKernel.Events;

/// <summary>
/// Ein anderes Modul reagiert auf ein <see cref="IDomainEvent"/> eines fremden
/// Moduls. Implementierungen leben im konsumierenden Modul (Application-Ebene)
/// und werden per DI registriert; <see cref="IDomainEventDispatcher"/> loest
/// sie zur Laufzeit anhand des Event-Typs auf.
/// </summary>
public interface IIntegrationEventHandler<in TEvent> where TEvent : IDomainEvent
{
    Task HandleAsync(TEvent domainEvent, CancellationToken cancellationToken);
}
