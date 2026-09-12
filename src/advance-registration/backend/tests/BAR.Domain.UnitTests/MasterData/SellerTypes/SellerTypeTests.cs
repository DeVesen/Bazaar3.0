using BAR.Modules.MasterData.Domain.SellerTypes;

namespace BAR.Domain.UnitTests.MasterData.SellerTypes;

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

    [Fact]
    public void Update_ValidData_ChangesAllFields()
    {
        var type = SellerType.Create("Standard", 12.5m, 0.50m);

        type.Update("Premium", 20.0m, 1.00m);

        Assert.Equal("Premium", type.Name);
        Assert.Equal(20.0m, type.CommissionRate);
        Assert.Equal(1.00m, type.ItemFee);
    }

    [Fact]
    public void Update_CommissionRateOutOfRange_Throws()
    {
        var type = SellerType.Create("Standard", 12.5m, 0.50m);

        Assert.Throws<ArgumentOutOfRangeException>(() => type.Update("Standard", 150m, 0.50m));
    }

    [Fact]
    public void Update_ItemFeeNegative_Throws()
    {
        var type = SellerType.Create("Standard", 12.5m, 0.50m);

        Assert.Throws<ArgumentOutOfRangeException>(() => type.Update("Standard", 12.5m, -1m));
    }
}
