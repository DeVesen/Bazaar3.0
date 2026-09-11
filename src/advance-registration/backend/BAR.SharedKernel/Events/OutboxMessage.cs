namespace BAR.SharedKernel.Events;

/// <summary>
/// Eine Vorleistung je meldendem Modul: von Anfang an billig, nachtraeglich
/// teuer (architecture-styles/references/data-flow.md). Jedes Modul, das
/// Events veroeffentlicht, persistiert sie zusaetzlich zum synchronen
/// In-Process-Dispatch als Zeile in seiner eigenen Outbox-Tabelle (eigenes
/// Schema) - ein Beleg, der spaeter eine asynchrone Zustellung ueber einen
/// Broker nachruesten liesse, ohne die Domaene anzufassen.
/// </summary>
public sealed class OutboxMessage
{
    public required string Id { get; init; }
    public required string Type { get; init; }
    public required string PayloadJson { get; init; }
    public required DateTime OccurredAtUtc { get; init; }
    public DateTime? ProcessedAtUtc { get; set; }
}
