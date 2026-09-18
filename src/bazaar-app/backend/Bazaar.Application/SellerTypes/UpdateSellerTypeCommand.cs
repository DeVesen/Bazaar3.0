namespace Bazaar.Application.SellerTypes;

/// <summary>
/// <see cref="Name"/>/<see cref="CommissionRate"/>/<see cref="ItemFee"/> are bound directly from
/// the JSON request body of PUT /api/seller-types/{id}. <see cref="Id"/> is NOT part of the wire
/// contract — the endpoint sets it from the route value after ASP.NET model binding.
/// </summary>
public sealed class UpdateSellerTypeCommand
{
    public string Id { get; set; } = string.Empty; // set by the endpoint from the route value
    public string Name { get; set; } = string.Empty;
    public decimal CommissionRate { get; set; }
    public decimal ItemFee { get; set; }
}
