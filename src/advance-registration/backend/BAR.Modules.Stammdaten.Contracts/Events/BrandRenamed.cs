using BAR.SharedKernel.Events;

namespace BAR.Modules.Stammdaten.Contracts.Events;

/// <summary>
/// Geschehenes, kein Aufruf: Stammdaten meldet, dass eine Marke umbenannt wurde.
/// Anmeldung haelt fuer bestehende Artikel eine eigene Namenskopie und reagiert
/// darauf (Application/EventHandlers/BrandRenamedHandler).
/// </summary>
public sealed record BrandRenamed(string OldName, string NewName, DateTime OccurredAtUtc) : IDomainEvent;
