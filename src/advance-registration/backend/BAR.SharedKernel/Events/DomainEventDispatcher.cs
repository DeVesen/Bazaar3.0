using Microsoft.Extensions.DependencyInjection;

namespace BAR.SharedKernel.Events;

/// <summary>
/// Loest zur Laufzeit alle <see cref="IIntegrationEventHandler{TEvent}"/> auf,
/// die ein anderes Modul fuer genau diesen Event-Typ registriert hat, und ruft
/// sie nacheinander auf. Fehlschlaege einzelner Handler werden geloggt statt
/// den aufrufenden (SaveChanges-)Vorgang scheitern zu lassen - die Outbox-Zeile
/// im meldenden Modul bleibt in diesem Fall die Vorleistung fuer eine spaetere,
/// bewusst nicht in diesem Zuschnitt gebaute Nachbearbeitung.
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
