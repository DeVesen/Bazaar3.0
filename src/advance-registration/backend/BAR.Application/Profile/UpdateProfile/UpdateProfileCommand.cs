namespace BAR.Application.Profile.UpdateProfile;

public sealed record UpdateProfileCommand(
    string FirstName, string LastName, string? Address, string PostalCode, string City, string Phone);
