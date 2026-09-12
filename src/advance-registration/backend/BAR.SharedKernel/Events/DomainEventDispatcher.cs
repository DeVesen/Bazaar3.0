using Microsoft.Extensions.DependencyInjection;

namespace BAR.SharedKernel.Events;

/// <summary>
/// Resolves, at runtime, every <see cref="IIntegrationEventHandler{TEvent}"/>
/// that another module has registered for exactly this event type, and calls
/// them one after another. Failures of individual handlers are logged rather
/// than failing the calling (SaveChanges) operation - in that case the outbox
/// row in the reporting module remains the groundwork for a later
/// reprocessing step that is deliberately not built in this cut.
/// </summary>
public sealed class DomainEventDispatcher(IServiceProvider serviceProvider) : IDomainEventDispatcher
{
    public async Task DispatchAsync(IDomainEvent domainEvent, CancellationToken cancellationToken)
    {
        var handlerType = typeof(IIntegrationEventHandler<>).MakeGenericType(domainEvent.GetType());
        var handlers = serviceProvider.GetServices(handlerType);

        foreach (var handler in handlers)
        {
            var handleAsync = handlerType.GetMethod(nameof(IIntegrationEventHandler<IDomainEvent>.HandleAsync))!;
            await (Task)handleAsync.Invoke(handler, [domainEvent, cancellationToken])!;
        }
    }
}
