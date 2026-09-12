using BAR.SharedKernel;

namespace BAR.Modules.Registration.Domain.Articles;

public sealed class Article
{
    private Article() { }

    public string Id { get; private init; } = null!;
    public int Number { get; private init; }
    public string SellerId { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public string Brand { get; private set; } = null!;
    public string Category { get; private set; } = null!;
    public decimal Price { get; private set; }
    public string? Size { get; private set; }
    public string? Color { get; private set; }
    public string? Description { get; private set; }
    public DateTime CreatedAt { get; private init; }
    public DateTime UpdatedAt { get; private set; }

    public static Article Create(
        string sellerId, int number, string name, string brand, string category,
        decimal price, string? size, string? color, string? description, DateTime nowUtc)
    {
        Validate(name, brand, category, price);

        return new Article
        {
            Id = EntityId.New(), Number = number, SellerId = sellerId,
            Name = name, Brand = brand, Category = category, Price = price,
            Size = size, Color = color, Description = description,
            CreatedAt = nowUtc, UpdatedAt = nowUtc
        };
    }

    public void Update(
        string name, string brand, string category, decimal price,
        string? size, string? color, string? description, DateTime nowUtc)
    {
        Validate(name, brand, category, price);

        Name = name; Brand = brand; Category = category; Price = price;
        Size = size; Color = color; Description = description;
        UpdatedAt = nowUtc;
    }

    /// <summary>Triggered by the BrandRenamed event from MasterData - see Application/EventHandlers.</summary>
    public void RenameBrand(string newName) => Brand = newName;

    /// <summary>Triggered by the CategoryRenamed event from MasterData.</summary>
    public void RenameCategory(string newName) => Category = newName;

    private static void Validate(string name, string brand, string category, decimal price)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name is required.", nameof(name));
        if (string.IsNullOrWhiteSpace(brand)) throw new ArgumentException("brand is required.", nameof(brand));
        if (string.IsNullOrWhiteSpace(category)) throw new ArgumentException("category is required.", nameof(category));
        if (price <= 0) throw new ArgumentException("price must be > 0.", nameof(price));
    }
}
