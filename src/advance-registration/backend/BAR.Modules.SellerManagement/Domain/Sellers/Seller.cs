using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.SellerManagement.Domain.Sellers;

public sealed class Seller
{
    private Seller() { }

    public string Id { get; private init; } = null!;
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string? Address { get; private set; }
    public string PostalCode { get; private set; } = null!;
    public string City { get; private set; } = null!;
    public string Phone { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public string SellerTypeId { get; private set; } = null!;
    public bool IsAdmin { get; private set; }
    public string? PasswordHash { get; private set; }
    public string? InviteToken { get; private set; }
    public DateTime? InviteTokenExpiresAt { get; private set; }

    public static Seller Register(
        string firstName, string lastName, string? address, string postalCode,
        string city, string phone, string email, string sellerTypeId,
        string passwordHash, bool isAdmin = false)
    {
        ValidateRequiredFields(firstName, lastName, postalCode, city, phone, email, sellerTypeId);

        return new Seller
        {
            Id = EntityId.New(),
            FirstName = firstName, LastName = lastName, Address = address,
            PostalCode = postalCode, City = city, Phone = phone, Email = email,
            SellerTypeId = sellerTypeId, IsAdmin = isAdmin, PasswordHash = passwordHash
        };
    }

    /// <summary>Admin creation (Epic_Verkaeufer panel 05) - no password, access only via invite link.</summary>
    public static Seller CreateByAdmin(
        string firstName, string lastName, string? address, string postalCode,
        string city, string phone, string email, string sellerTypeId, bool isAdmin)
    {
        ValidateRequiredFields(firstName, lastName, postalCode, city, phone, email, sellerTypeId);

        return new Seller
        {
            Id = EntityId.New(),
            FirstName = firstName, LastName = lastName, Address = address,
            PostalCode = postalCode, City = city, Phone = phone, Email = email,
            SellerTypeId = sellerTypeId, IsAdmin = isAdmin
        };
    }

    public void UpdateProfile(string firstName, string lastName, string? address, string postalCode, string city, string phone)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("firstName is required.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("lastName is required.", nameof(lastName));
        if (string.IsNullOrWhiteSpace(postalCode)) throw new ArgumentException("postalCode is required.", nameof(postalCode));
        if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("city is required.", nameof(city));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("phone is required.", nameof(phone));

        FirstName = firstName;
        LastName = lastName;
        Address = address;
        PostalCode = postalCode;
        City = city;
        Phone = phone;
    }

    /// <summary>Full admin edit (Edit-Seller dialog, panels 01-05) - unlike
    /// <see cref="UpdateProfile"/>, this also changes Email, SellerTypeId and IsAdmin.</summary>
    public void UpdateAsAdmin(
        string firstName, string lastName, string? address, string postalCode,
        string city, string phone, string email, string sellerTypeId, bool isAdmin)
    {
        ValidateRequiredFields(firstName, lastName, postalCode, city, phone, email, sellerTypeId);

        FirstName = firstName;
        LastName = lastName;
        Address = address;
        PostalCode = postalCode;
        City = city;
        Phone = phone;
        Email = email;
        SellerTypeId = sellerTypeId;
        IsAdmin = isAdmin;
    }

    /// <summary>Generates and overwrites the invite token (api/sellers.md section 5) - calling this again invalidates the old one.</summary>
    public string GenerateInviteToken(DateTime nowUtc)
    {
        var token = Guid.NewGuid().ToString("N");
        InviteToken = token;
        InviteTokenExpiresAt = nowUtc.AddDays(7);
        return token;
    }

    /// <summary>Consumes the invite token and sets the initial password (api/auth.md section 4).</summary>
    public void ConsumePassword(string passwordHash, DateTime nowUtc)
    {
        if (InviteTokenExpiresAt is null || InviteTokenExpiresAt < nowUtc)
        {
            throw new UnauthorizedException("auth.invalid_invite_token", "Token unbekannt, bereits verbraucht oder abgelaufen");
        }

        PasswordHash = passwordHash;
        InviteToken = null;
        InviteTokenExpiresAt = null;
    }

    public void ChangeEmail(string newEmail)
    {
        if (string.IsNullOrWhiteSpace(newEmail)) throw new ArgumentException("newEmail is required.", nameof(newEmail));
        Email = newEmail;
    }

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash)) throw new ArgumentException("newPasswordHash is required.", nameof(newPasswordHash));
        PasswordHash = newPasswordHash;
    }

    private static void ValidateRequiredFields(
        string firstName, string lastName, string postalCode, string city, string phone, string email, string sellerTypeId)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("firstName is required.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("lastName is required.", nameof(lastName));
        if (string.IsNullOrWhiteSpace(postalCode)) throw new ArgumentException("postalCode is required.", nameof(postalCode));
        if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("city is required.", nameof(city));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("phone is required.", nameof(phone));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("email is required.", nameof(email));
        if (string.IsNullOrWhiteSpace(sellerTypeId)) throw new ArgumentException("sellerTypeId is required.", nameof(sellerTypeId));
    }
}
