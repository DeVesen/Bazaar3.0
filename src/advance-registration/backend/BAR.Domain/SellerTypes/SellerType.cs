using BAR.Domain.Common;

namespace BAR.Domain.SellerTypes;

public sealed class SellerType
{
    private SellerType() { }

    public string Id { get; private init; } = null!;
    public string Name { get; private init; } = null!;
    public decimal CommissionRate { get; private init; }
    public decimal ItemFee { get; private init; }

    public static SellerType Create(string name, decimal commissionRate, decimal itemFee)
    {
        if (string.IsNullOrWhiteSpace(name)) throw new ArgumentException("name ist Pflicht.", nameof(name));
        if (commissionRate is < 0 or > 100) throw new ArgumentOutOfRangeException(nameof(commissionRate), "commissionRate muss zwischen 0 und 100 liegen.");
        if (itemFee < 0) throw new ArgumentOutOfRangeException(nameof(itemFee), "itemFee darf nicht negativ sein.");

        return new SellerType { Id = EntityId.New(), Name = name, CommissionRate = commissionRate, ItemFee = itemFee };
    }
}
