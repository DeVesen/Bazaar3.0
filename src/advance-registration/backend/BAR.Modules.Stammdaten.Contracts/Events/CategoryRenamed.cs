using BAR.SharedKernel.Events;

namespace BAR.Modules.Stammdaten.Contracts.Events;

/// <summary>Siehe <see cref="BrandRenamed"/> - identisches Muster fuer Kategorien.</summary>
public sealed record CategoryRenamed(string OldName, string NewName, DateTime OccurredAtUtc) : IDomainEvent;
