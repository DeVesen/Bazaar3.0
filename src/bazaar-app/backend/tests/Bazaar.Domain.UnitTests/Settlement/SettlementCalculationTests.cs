using Bazaar.Domain.Settlement;

namespace Bazaar.Domain.UnitTests.Settlement;

public class SettlementCalculationTests
{
    [Fact]
    public void Calculate_EpicCanonicalExample_RoundsCommissionAwayFromZero()
    {
        var (commission, payout) = SettlementCalculation.Calculate(380.50m, 12.5m);

        Assert.Equal(47.56m, commission);
        Assert.Equal(332.94m, payout);
    }

    [Fact]
    public void Calculate_SecondRoundingCase_RoundsCommissionAwayFromZero()
    {
        var (commission, payout) = SettlementCalculation.Calculate(87.50m, 15m);

        Assert.Equal(13.13m, commission);
        Assert.Equal(74.37m, payout);
    }
}
