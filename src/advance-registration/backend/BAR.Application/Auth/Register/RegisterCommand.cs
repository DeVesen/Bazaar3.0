namespace BAR.Application.Auth.Register;

public sealed record RegisterCommand(
    string Email, string Password, string FirstName, string LastName,
    string? Address, string PostalCode, string City, string Phone);
