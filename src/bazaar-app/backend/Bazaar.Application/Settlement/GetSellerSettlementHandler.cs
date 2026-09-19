using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Settlement;

namespace Bazaar.Application.Settlement;

public sealed class GetSellerSettlementHandler(ISellerSettlementQuery sellerSettlementQuery)
{
    public async Task<SellerSettlementResult> Handle(string sellerId)
    {
        var readModel = await sellerSettlementQuery.GetSettlement(sellerId)
            ?? throw new NotFoundException("Verkäufer nicht gefunden", "seller.not_found");

        var (commission, payout) = SettlementCalculation.Calculate(readModel.Revenue, readModel.CommissionRate);

        var releasedCount = readModel.OpenCount + readModel.SoldCount + readModel.ReturnedCount;
        var canSettle = releasedCount > 0 && readModel.OpenCount == 0;

        return new SellerSettlementResult(
            readModel.SellerId,
            readModel.FirstName,
            readModel.LastName,
            readModel.Address,
            readModel.PostalCode,
            readModel.City,
            readModel.OpenCount,
            readModel.SoldCount,
            readModel.ReturnedCount,
            readModel.Revenue,
            readModel.CommissionRate,
            commission,
            payout,
            readModel.IntakeFeePaid,
            readModel.NotDeliveredCount,
            readModel.SettledAt,
            readModel.PayoutAmount,
            canSettle);
    }
}

public sealed record SellerSettlementResult(
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
    decimal Commission,
    decimal Payout,
    decimal IntakeFeePaid,
    int NotDeliveredCount,
    DateTimeOffset? SettledAt,
    decimal? PayoutAmount,
    bool CanSettle);
