namespace Bazaar.Application.Sellers;

/// <summary>
/// <see cref="FirstName"/>/<see cref="LastName"/>/<see cref="Email"/>/<see cref="Address"/>/
/// <see cref="PostalCode"/>/<see cref="City"/>/<see cref="Phone"/>/<see cref="SellerTypeId"/>/
/// <see cref="SalesCommission"/>/<see cref="FeePerItem"/> are bound directly from the JSON
/// request body of PUT /api/sellers/{id}. <see cref="Id"/> is NOT part of the wire contract —
/// the endpoint sets it from the route value after ASP.NET model binding.
/// <see cref="CallerIsAdmin"/> is NOT part of the wire contract either — the endpoint sets it
/// from the authenticated caller's role claim after ASP.NET model binding (and after the
/// ValidationFilter has already run), not bound from JSON.
/// </summary>
public sealed class UpdateSellerCommand
{
    public string Id { get; set; } = string.Empty; // set by the endpoint from the route value
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? PostalCode { get; set; }
    public string? City { get; set; }
    public string? Phone { get; set; }
    public string SellerTypeId { get; set; } = string.Empty;
    public decimal SalesCommission { get; set; }
    public decimal FeePerItem { get; set; }
    public bool CallerIsAdmin { get; set; } // set by the endpoint from the role claim, not bound from JSON
}
