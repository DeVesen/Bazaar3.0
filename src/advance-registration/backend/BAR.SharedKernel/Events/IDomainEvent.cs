namespace BAR.SharedKernel.Events;

/// <summary>
/// Markiert ein Geschehenes, das ein Modul ueber seine Contracts-Grenze hinweg
/// meldet (architecture-styles: "Events transportieren Geschehenes, keine
/// Fragen"). Der konkrete Event-Typ lebt im <c>.Contracts</c>-Projekt des
/// meldenden Moduls - er ist Teil von dessen oeffentlichem Vokabular.
/// </summary>
public interface IDomainEvent
{
    DateTime OccurredAtUtc { get; }
}
