using BAR.Domain.Common;

namespace BAR.Domain.Sellers;

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
    public string Email { get; private init; } = null!;
    public string SellerTypeId { get; private init; } = null!;
    public bool IsAdmin { get; private init; }
    public string? PasswordHash { get; private set; }
    public string? InviteToken { get; private set; }
    public DateTime? InviteTokenExpiresAt { get; private set; }

    public static Seller Register(
        string firstName, string lastName, string? address, string postalCode,
        string city, string phone, string email, string sellerTypeId,
        string passwordHash, bool isAdmin = false)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("firstName ist Pflicht.", nameof(firstName));
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("lastName ist Pflicht.", nameof(lastName));
        if (string.IsNullOrWhiteSpace(postalCode)) throw new ArgumentException("postalCode ist Pflicht.", nameof(postalCode));
        if (string.IsNullOrWhiteSpace(city)) throw new ArgumentException("city ist Pflicht.", nameof(city));
        if (string.IsNullOrWhiteSpace(phone)) throw new ArgumentException("phone ist Pflicht.", nameof(phone));
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("email ist Pflicht.", nameof(email));
        if (string.IsNullOrWhiteSpace(sellerTypeId)) throw new ArgumentException("sellerTypeId ist Pflicht.", nameof(sellerTypeId));

        return new Seller
        {
            Id = EntityId.New(),
            FirstName = firstName, LastName = lastName, Address = address,
            PostalCode = postalCode, City = city, Phone = phone, Email = email,
            SellerTypeId = sellerTypeId, IsAdmin = isAdmin, PasswordHash = passwordHash
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
}
