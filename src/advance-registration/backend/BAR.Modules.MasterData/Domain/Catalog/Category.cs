using BAR.Modules.MasterData.Contracts.Events;
using BAR.SharedKernel;
using BAR.SharedKernel.Events;

namespace BAR.Modules.MasterData.Domain.Catalog;

public sealed class Category : IHasDomainEvents
{
    private readonly List<IDomainEvent> _domainEvents = [];

    private Category() { }

    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public bool Original { get; private set; }

    public IReadOnlyList<IDomainEvent> DomainEvents => _domainEvents;

    public void ClearDomainEvents() => _domainEvents.Clear();

    public static Category Create(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        return new Category { Id = EntityId.New(), Name = name, Original = original };
    }

    /// <summary>Siehe <see cref="Brand.Rename"/> - identisches Muster.</summary>
    public void Rename(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        var oldName = Name;
        Name = name;
        Original = original;

        if (oldName is not null && oldName != name)
        {
            _domainEvents.Add(new CategoryRenamed(oldName, name, DateTime.UtcNow));
        }
    }
}
