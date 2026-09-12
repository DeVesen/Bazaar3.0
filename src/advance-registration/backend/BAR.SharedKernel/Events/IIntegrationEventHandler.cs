namespace BAR.SharedKernel.Events;

/// <summary>
/// Another module reacts to an <see cref="IDomainEvent"/> raised by a
/// different module. Implementations live in the consuming module
/// (Application layer) and are registered via DI;
/// <see cref="IDomainEventDispatcher"/> resolves them at runtime by event type.
/// </summary>
public interface IIntegrationEventHandler<in TEvent> where TEvent : IDomainEvent
{
    Task HandleAsync(TEvent domainEvent, CancellationToken cancellationToken);
}
