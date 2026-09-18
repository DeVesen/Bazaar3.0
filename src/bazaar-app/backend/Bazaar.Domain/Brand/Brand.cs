namespace Bazaar.Domain.Brands;

public sealed class Brand
{
    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public bool Original { get; private set; }

    public static Brand Create(string id, string name, bool original)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id required.");
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name required.");
        return new Brand { Id = id, Name = name.Trim(), Original = original };
    }

    public void Rename(string name)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name required.");
        Name = name.Trim();
    }

    public void SetOriginal(bool original) => Original = original;
}
