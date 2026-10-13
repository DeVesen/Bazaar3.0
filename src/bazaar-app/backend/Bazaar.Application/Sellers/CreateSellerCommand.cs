namespace Bazaar.Application.Sellers;

/// <summary>
/// All properties are bound directly from the JSON request body of POST /api/sellers.
/// <see cref="SalesCommission"/>/<see cref="FeePerItem"/> are NOT part of this command —
/// the server derives them from the seller type, a cash-desk request must not set conditions.
/// </summary>
public sealed class CreateSellerCommand
{
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string? Email { get; set; }
    public string SellerTypeId { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public string City { get; set; } = string.Empty;
    public string? Phone { get; set; }
}
