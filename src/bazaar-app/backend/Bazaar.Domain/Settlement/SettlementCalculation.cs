namespace Bazaar.Domain.Settlement;

/// <summary>
/// Single canonical rounding rule for the revenue→commission→payout chain
/// (api/settlement.md: "genau eine Rundung", kaufmännisch,
/// MidpointRounding.AwayFromZero, 2 Dezimalstellen). Extracted here because
/// it is used by GetSellerSettlementHandler (Round-20) and reused identically
/// by the settle-seller flow (Round-21).
/// </summary>
public static class SettlementCalculation
{
    public static (decimal Commission, decimal Payout) Calculate(decimal revenue, decimal commissionRate)
    {
        var commission = Math.Round(revenue * commissionRate / 100m, 2, MidpointRounding.AwayFromZero);
        return (commission, revenue - commission);
    }
}
