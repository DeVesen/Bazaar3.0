using BAR.Domain.Common;

namespace BAR.Domain.MasterData;

public sealed class Brand
{
    private Brand() { }

    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public bool Original { get; private set; }

    public static Brand Create(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        return new Brand { Id = EntityId.New(), Name = name, Original = original };
    }

    public void Rename(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        Name = name;
        Original = original;
    }
}
