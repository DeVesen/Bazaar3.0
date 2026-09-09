using BAR.Domain.Common;

namespace BAR.Domain.MasterData;

public sealed class Category
{
    private Category() { }

    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public bool Original { get; private set; }

    public static Category Create(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        return new Category { Id = EntityId.New(), Name = name, Original = original };
    }

    public void Rename(string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));

        Name = name;
        Original = original;
    }
}
