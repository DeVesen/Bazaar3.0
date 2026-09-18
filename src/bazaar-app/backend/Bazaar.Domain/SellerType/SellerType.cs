namespace Bazaar.Domain.SellerTypes;

public sealed class SellerType
{
    public string Id { get; private init; } = null!;
    public string Name { get; private set; } = null!;
    public decimal CommissionRate { get; private set; }
    public decimal ItemFee { get; private set; }

    public static SellerType Create(string id, string name, decimal commissionRate, decimal itemFee)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id required.");
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name required.");
        EnsureValidRange(commissionRate, itemFee);
        return new SellerType
        {
            Id = id,
            Name = name.Trim(),
            CommissionRate = commissionRate,
            ItemFee = itemFee
        };
    }

    public void Update(string name, decimal commissionRate, decimal itemFee)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("Name required.");
        EnsureValidRange(commissionRate, itemFee);
        Name = name.Trim();
        CommissionRate = commissionRate;
        ItemFee = itemFee;
    }

    private static void EnsureValidRange(decimal commissionRate, decimal itemFee)
    {
        if (commissionRate is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(commissionRate));
        if (itemFee < 0) throw new ArgumentOutOfRangeException(nameof(itemFee));
    }
}
