namespace Bazaar.Application.SellerTypes;

/// <summary>
/// All three fields are bound directly from the JSON request body of POST /api/seller-types.
/// SellerType has no <c>Original</c> equivalent, unlike Category.
/// </summary>
public sealed class CreateSellerTypeCommand
{
    public string Name { get; set; } = string.Empty;
    public decimal CommissionRate { get; set; }
    public decimal ItemFee { get; set; }
}
