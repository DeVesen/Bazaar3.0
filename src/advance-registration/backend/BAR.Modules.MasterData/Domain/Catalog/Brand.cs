using BAR.Modules.MasterData.Contracts.Events;
using BAR.SharedKernel;
using BAR.SharedKernel.Events;

namespace BAR.Modules.MasterData.Domain.Catalog;

public sealed class Brand : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = [];

    private Brand() { }

    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public bool Original { get; private set; }

    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents;

    public void ClearDomainEvents() => _domainEvents.Clear();

    public static Brand Create(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name is required.", nameof(name));

        return new Brand { Id = EntityId.New(), Name = name, Original = original };
    }

    /// <summary>
    /// If the name actually changes, the domain reports this as
    /// <see cref="BrandRenamed"/> - Registration keeps its own copy of the
    /// brand name on existing articles and updates it through this event (MasterData
    /// can no longer write to Registration's tables directly, since it has its
    /// own schema).
    /// </summary>
    public void Rename(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name is required.", nameof(name));

        var oldName = Name;
        Name = name;
        Original = original;

        if (oldName is not null && oldName != name)
        {
            _domainEvents.Add(new BrandRenamed(oldName, name, DateTime.UtcNow));
        }
    }
}
