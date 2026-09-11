using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;

namespace BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;

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

    /// <summary>Admin-Anlage (Epic_Verkaeufer Panel 05) - kein Passwort, Zugang erst per Invite-Link.</summary>
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
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("firstName ist Pflicht.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("lastName ist Pflicht.", nameof(lastName));
        if (string.IsNullOrWhiteSpace(postalCode)) throw new ArgumentException("postalCode ist Pflicht.", nameof(postalCode));
        if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("city ist Pflicht.", nameof(city));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("phone ist Pflicht.", nameof(phone));

        FirstName = firstName;
        LastName = lastName;
        Address = address;
        PostalCode = postalCode;
        City = city;
        Phone = phone;
    }

    /// <summary>Admin-Vollbearbeitung (Verkaeufer-Bearbeiten-Dialog Panel 01-05) - im Unterschied
    /// zu <see cref="UpdateProfile"/> aendern sich hier auch Email, SellerTypeId und IsAdmin.</summary>
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

    /// <summary>Erzeugt und ueberschreibt das Invite-Token (api/sellers.md Abschnitt 5) - ein erneuter Aufruf entwertet das alte.</summary>
    public string GenerateInviteToken(DateTime nowUtc)
    {
        var token = Guid.NewGuid().ToString("N");
        InviteToken = token;
        InviteTokenExpiresAt = nowUtc.AddDays(7);
        return token;
    }

    /// <summary>Verbraucht das Invite-Token und setzt das Erstpasswort (api/auth.md Abschnitt 4).</summary>
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
        if (string.IsNullOrWhiteSpace(newEmail)) throw new ArgumentException("newEmail ist Pflicht.", nameof(newEmail));
        Email = newEmail;
    }

    public void ChangePassword(string newPasswordHash)
    {
        if (string.IsNullOrWhiteSpace(newPasswordHash)) throw new ArgumentException("newPasswordHash ist Pflicht.", nameof(newPasswordHash));
        PasswordHash = newPasswordHash;
    }

    private static void ValidateRequiredFields(
        string firstName, string lastName, string postalCode, string city, string phone, string email, string sellerTypeId)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("firstName ist Pflicht.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("lastName ist Pflicht.", nameof(lastName));
        if (string.IsNullOrWhiteSpace(postalCode)) throw new ArgumentException("postalCode ist Pflicht.", nameof(postalCode));
        if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("city ist Pflicht.", nameof(city));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("phone ist Pflicht.", nameof(phone));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("email ist Pflicht.", nameof(email));
        if (string.IsNullOrWhiteSpace(sellerTypeId)) throw new ArgumentException("sellerTypeId ist Pflicht.", nameof(sellerTypeId));
    }
}
