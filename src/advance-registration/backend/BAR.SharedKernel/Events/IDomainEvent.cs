namespace BAR.SharedKernel.Events;

/// <summary>
/// Marks something that happened, which a module reports across its
/// Contracts boundary (architecture-styles: "events carry what happened, not
/// questions"). The concrete event type lives in the reporting module's
/// <c>.Contracts</c> project - it is part of that module's public vocabulary.
/// </summary>
public interface IDomainEvent
{
    DateTime OccurredAtUtc { get; }
}
