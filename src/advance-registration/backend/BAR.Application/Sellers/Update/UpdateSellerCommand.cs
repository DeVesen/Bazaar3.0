namespace BAR.Application.Sellers.Update;

public sealed record UpdateSellerCommand(
    string SellerId, string FirstName, string LastName, string? Address, string PostalCode,
    string City, string Phone, string Email, string SellerTypeId, bool IsAdmin);
