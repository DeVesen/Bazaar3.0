namespace Bazaar.Application.Settlement;

/// <summary>
/// Backs POST /api/sellers/{id}/settlement (api/settlement.md §3). SellerId
/// comes from the route, PayoutAmount from the JSON body — both land on one
/// command so the handler has a single input type (mirrors ReleaseCommand).
/// </summary>
public sealed class SettleSellerCommand
{
    public string SellerId { get; set; } = string.Empty;
    public decimal PayoutAmount { get; set; }
}
