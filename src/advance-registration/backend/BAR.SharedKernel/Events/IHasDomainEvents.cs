namespace BAR.SharedKernel.Events;

/// <summary>
/// An aggregate that collects events during an operation instead of firing
/// them immediately. The reporting module's DbContext reads
/// <see cref="DomainEvents"/> right before <c>SaveChanges</c> and clears them
/// afterward via <see cref="ClearDomainEvents"/> - the domain itself knows
/// neither the dispatcher nor the outbox.
/// </summary>
public interface IHasDomainEvents
{
    IReadOnlyList<IDomainEvent> DomainEvents { get; }
    void ClearDomainEvents();
}
