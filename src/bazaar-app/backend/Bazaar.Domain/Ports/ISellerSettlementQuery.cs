namespace Bazaar.Domain.Ports;

/// <summary>
/// Read-model port for GET /api/sellers/{id}/settlement (api/settlement.md,
/// Round-20). Returns ONLY raw values read from the Seller/Article records —
/// commission, payout and canSettle are business-rule derivations computed by
/// GetSellerSettlementHandler via SettlementCalculation, not here.
/// CommissionRate is Seller.SalesCommission read directly from the Seller
/// record, never from the seller's current SellerType.
/// </summary>
public interface ISellerSettlementQuery
{
    Task<SellerSettlementReadModel?> GetSettlement(string sellerId);
}

public sealed record SellerSettlementReadModel(
    string SellerId,
    string FirstName,
    string LastName,
    string? Address,
    string? PostalCode,
    string? City,
    int OpenCount,
    int SoldCount,
    int ReturnedCount,
    decimal Revenue,
    decimal CommissionRate,
    decimal IntakeFeePaid,
    int NotDeliveredCount,
    DateTimeOffset? SettledAt,
    decimal? PayoutAmount);
