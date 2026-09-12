namespace BAR.SharedKernel.Events;

/// <summary>
/// A piece of groundwork laid by each reporting module: cheap up front,
/// expensive to add later (architecture-styles/references/data-flow.md).
/// Every module that publishes events persists them, in addition to the
/// synchronous in-process dispatch, as a row in its own outbox table (its
/// own schema) - a record that would later let asynchronous delivery via a
/// broker be retrofitted without touching the domain.
/// </summary>
public sealed class OutboxMessage
{
    public required string Id { get; init; }
    public required string Type { get; init; }
    public required string PayloadJson { get; init; }
    public required DateTime OccurredAtUtc { get; init; }
    public DateTime? ProcessedAtUtc { get; set; }
}
