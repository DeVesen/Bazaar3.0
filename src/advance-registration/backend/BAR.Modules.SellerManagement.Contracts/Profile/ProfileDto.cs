namespace BAR.Modules.SellerManagement.Contracts.Profile;

public sealed record ProfileSellerTypeDto(string Id, string Name, decimal CommissionRate, decimal ItemFee);

public sealed record ProfileDto(
    string Id, string FirstName, string LastName, string? Address, string PostalCode,
    string City, string Phone, string Email, ProfileSellerTypeDto SellerType);

public sealed record UpdateProfileCommand(string FirstName, string LastName, string? Address, string PostalCode, string City, string Phone);

public sealed record ChangeEmailCommand(string NewEmail, string CurrentPassword);

public sealed record ChangePasswordCommand(string CurrentPassword, string NewPassword, string NewPasswordConfirmation);
