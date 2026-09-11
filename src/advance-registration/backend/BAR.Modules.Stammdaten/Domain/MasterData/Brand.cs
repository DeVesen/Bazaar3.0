using BAR.Modules.Stammdaten.Contracts.Events;
using BAR.SharedKernel;
using BAR.SharedKernel.Events;

namespace BAR.Modules.Stammdaten.Domain.MasterData;

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
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        return new Brand { Id = EntityId.New(), Name = name, Original = original };
    }

    /// <summary>
    /// Aendert sich der Name tatsaechlich, meldet die Domaene das als
    /// <see cref="BrandRenamed"/> - Anmeldung haelt fuer bestehende Artikel eine
    /// eigene Kopie des Markennamens und aktualisiert sie darueber (kein
    /// Schreibzugriff von Stammdaten auf Anmeldungs-Tabellen mehr moeglich, da
    /// eigenes Schema).
    /// </summary>
    public void Rename(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        var oldName = Name;
        Name = name;
        Original = original;

        if (oldName is not null && oldName != name)
        {
            _domainEvents.Add(new BrandRenamed(oldName, name, DateTime.UtcNow));
        }
    }
}
