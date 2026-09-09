using BAR.Domain.SellerTypes;

namespace BAR.Domain.UnitTests.SellerTypes;

public class SellerTypeTests
{
    [Fact]
    public void Create_ValidData_CreatesSellerType()
    {
        var type = SellerType.Create("Standard", 15.0m, 0.50m);

        Assert.Equal(8, type.Id.Length);
        Assert.Equal("Standard", type.Name);
        Assert.Equal(15.0m, type.CommissionRate);
        Assert.Equal(0.50m, type.ItemFee);
    }

    [Theory]
    [InlineData(-1, 0.5)]
    [InlineData(101, 0.5)]
    public void Create_CommissionRateOutOfRange_Throws(decimal commissionRate, decimal itemFee)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() => SellerType.Create("Standard", commissionRate, itemFee));
    }
}
