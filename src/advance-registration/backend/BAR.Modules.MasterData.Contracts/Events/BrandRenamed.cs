using BAR.SharedKernel.Events;

namespace BAR.Modules.MasterData.Contracts.Events;

/// <summary>
/// Something that happened, not a call: MasterData announces that a brand
/// was renamed. Registration keeps its own copy of the name on existing
/// articles and reacts to this event (Application/EventHandlers/BrandRenamedHandler).
/// </summary>
public sealed record BrandRenamed(string OldName, string NewName, DateTime OccurredAtUtc) : IDomainEvent;
