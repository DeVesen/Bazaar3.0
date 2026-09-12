namespace BAR.Modules.SellerManagement.Contracts.Auth;

public sealed record RegisterCommand(
    string Email, string Password, string FirstName, string LastName,
    string? Address, string PostalCode, string City, string Phone);

public sealed record LoginCommand(string Email, string Password);

public sealed record RefreshCommand(string RefreshToken);

public sealed record SetPasswordCommand(string InviteToken, string Password);
