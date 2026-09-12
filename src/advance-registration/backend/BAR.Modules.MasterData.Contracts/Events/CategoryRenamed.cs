using BAR.SharedKernel.Events;

namespace BAR.Modules.MasterData.Contracts.Events;

/// <summary>See <see cref="BrandRenamed"/> - the identical pattern for categories.</summary>
public sealed record CategoryRenamed(string OldName, string NewName, DateTime OccurredAtUtc) : IDomainEvent;
