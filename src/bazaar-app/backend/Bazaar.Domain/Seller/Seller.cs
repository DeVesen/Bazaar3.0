namespace Bazaar.Domain.Sellers;

public sealed class Seller
{
    public string Id { get; private init; } = null!;
    public string FirstName { get; private set; } = null!;
    public string LastName { get; private set; } = null!;
    public string? Address { get; private set; }
    public string? PostalCode { get; private set; }
    public string? City { get; private set; }
    public string? Phone { get; private set; }
    public string Email { get; private set; } = null!;
    public string SellerTypeId { get; private set; } = null!;
    public decimal SalesCommission { get; private set; }
    public decimal FeePerItem { get; private set; }
    public decimal IntakeFeePaid { get; private set; }
    public DateTimeOffset? SettledAt { get; private set; }
    public decimal? PayoutAmount { get; private set; }

    public static Seller Create(
        string id,
        string firstName,
        string lastName,
        string? address,
        string? postalCode,
        string? city,
        string? phone,
        string email,
        string sellerTypeId,
        decimal salesCommission,
        decimal feePerItem)
    {
        if (string.IsNullOrWhiteSpace(id)) throw new ArgumentException("Id required.");
        EnsureRequiredFields(firstName, lastName, email, sellerTypeId);

        return new Seller
        {
            Id = id,
            FirstName = firstName.Trim(),
            LastName = lastName.Trim(),
            Address = address,
            PostalCode = postalCode,
            City = city,
            Phone = phone,
            Email = email.Trim(),
            SellerTypeId = sellerTypeId,
            SalesCommission = salesCommission,
            FeePerItem = feePerItem,
            IntakeFeePaid = 0m
        };
    }

    /// <summary>
    /// Updates the basic Stammdaten fields. Deliberately excludes
    /// SalesCommission/FeePerItem — those are updated only via
    /// <see cref="UpdateConditions"/>, since UpdateSellerHandler's
    /// admin-only gate depends on being able to call both independently.
    /// </summary>
    public void UpdateDetails(
        string firstName,
        string lastName,
        string? address,
        string? postalCode,
        string? city,
        string? phone,
        string email,
        string sellerTypeId)
    {
        EnsureRequiredFields(firstName, lastName, email, sellerTypeId);

        FirstName = firstName.Trim();
        LastName = lastName.Trim();
        Address = address;
        PostalCode = postalCode;
        City = city;
        Phone = phone;
        Email = email.Trim();
        SellerTypeId = sellerTypeId;
    }

    public void UpdateConditions(decimal salesCommission, decimal feePerItem)
    {
        SalesCommission = salesCommission;
        FeePerItem = feePerItem;
    }

    /// <summary>
    /// Resets a settlement, e.g. when a settlement is cancelled/storniert.
    /// Called by <c>ResetSellerSettlementHandler</c> (DELETE
    /// /api/sellers/{id}/settlement, Round-14) — Seller is the aggregate
    /// that must encapsulate this, so it is provided here.
    /// </summary>
    public void ResetSettlement()
    {
        SettledAt = null;
        PayoutAmount = null;
    }

    /// <summary>
    /// Settles the seller with the given payout amount. Takes the
    /// settlement timestamp as a parameter (rather than reading
    /// DateTimeOffset.UtcNow directly), mirroring the pattern used by
    /// ITokenIssuer.IssueAccessToken(User, DateTime nowUtc) elsewhere in
    /// this codebase. Not called by any handler until Round-20/21.
    /// </summary>
    public void Settle(decimal payoutAmount, DateTimeOffset settledAt)
    {
        PayoutAmount = payoutAmount;
        SettledAt = settledAt;
    }

    /// <summary>
    /// Adds to <see cref="IntakeFeePaid"/> — called once per intake
    /// transaction (api/intake.md: "feeAmount wird auf intakeFeePaid des
    /// Verkäufers addiert"). Additive, never a replace, since a seller can
    /// go through intake more than once (e.g. bringing a second box later).
    /// </summary>
    public void AddIntakeFeePaid(decimal amount)
    {
        if (amount < 0) throw new ArgumentException("Amount must not be negative.");
        IntakeFeePaid += amount;
    }

    private static void EnsureRequiredFields(string firstName, string lastName, string email, string sellerTypeId)
    {
        if (string.IsNullOrWhiteSpace(firstName)) throw new ArgumentException("FirstName required.");
        if (string.IsNullOrWhiteSpace(lastName)) throw new ArgumentException("LastName required.");
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("Email required.");
        if (string.IsNullOrWhiteSpace(sellerTypeId)) throw new ArgumentException("SellerTypeId required.");
    }
}
