namespace BAR.Application.Sellers.Create;

public sealed record CreateSellerCommand(
    string FirstName, string LastName, string? Address, string PostalCode, string City,
    string Phone, string Email, string SellerTypeId, bool IsAdmin, int? StartNumber, int? BlockCount);
