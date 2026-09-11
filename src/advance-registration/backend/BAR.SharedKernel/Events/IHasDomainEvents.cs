namespace BAR.SharedKernel.Events;

/// <summary>
/// Ein Aggregate, das waehrend eines Vorgangs Events sammelt, statt sie sofort
/// zu feuern. Der DbContext des meldenden Moduls liest <see cref="DomainEvents"/>
/// unmittelbar vor <c>SaveChanges</c> aus und loescht sie danach ueber
/// <see cref="ClearDomainEvents"/> - die Domaene selbst kennt weder Dispatcher
/// noch Outbox.
/// </summary>
public interface IHasDomainEvents
{
    IReadOnlyList<IDomainEvent> DomainEvents { get; }
    void ClearDomainEvents();
}
