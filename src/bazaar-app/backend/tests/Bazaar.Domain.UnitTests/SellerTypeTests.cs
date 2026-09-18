using Bazaar.Domain.SellerTypes;

namespace Bazaar.Domain.UnitTests;

public class SellerTypeTests
{
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceId_Throws(string id)
    {
        Assert.Throws<ArgumentException>(() =>
            SellerType.Create(id, "Vereinsverkäufer", 10m, 0.5m));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceName_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() =>
            SellerType.Create("sellertype-1", name, 10m, 0.5m));
    }

    [Fact]
    public void Create_WithValidData_SetsAllPropertiesAndTrimsName()
    {
        var sellerType = SellerType.Create("sellertype-1", "  Vereinsverkäufer  ", 10m, 0.5m);

        Assert.Equal("sellertype-1", sellerType.Id);
        Assert.Equal("Vereinsverkäufer", sellerType.Name);
        Assert.Equal(10m, sellerType.CommissionRate);
        Assert.Equal(0.5m, sellerType.ItemFee);
    }

    [Theory]
    [InlineData(-0.01)]
    [InlineData(100.01)]
    public void Create_WithCommissionRateOutOfRange_Throws(decimal commissionRate)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SellerType.Create("sellertype-1", "Acme", commissionRate, 0.5m));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(100)]
    public void Create_WithCommissionRateAtBoundary_Succeeds(decimal commissionRate)
    {
        var sellerType = SellerType.Create("sellertype-1", "Acme", commissionRate, 0.5m);

        Assert.Equal(commissionRate, sellerType.CommissionRate);
    }

    [Fact]
    public void Create_WithNegativeItemFee_Throws()
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SellerType.Create("sellertype-1", "Acme", 10m, -0.01m));
    }

    [Fact]
    public void Create_WithZeroItemFee_Succeeds()
    {
        var sellerType = SellerType.Create("sellertype-1", "Acme", 10m, 0m);

        Assert.Equal(0m, sellerType.ItemFee);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Update_WithEmptyOrWhitespaceName_Throws(string name)
    {
        var sellerType = SellerType.Create("sellertype-1", "Acme", 10m, 0.5m);

        Assert.Throws<ArgumentException>(() => sellerType.Update(name, 10m, 0.5m));
    }

    [Theory]
    [InlineData(-0.01)]
    [InlineData(100.01)]
    public void Update_WithCommissionRateOutOfRange_Throws(decimal commissionRate)
    {
        var sellerType = SellerType.Create("sellertype-1", "Acme", 10m, 0.5m);

        Assert.Throws<ArgumentOutOfRangeException>(() => sellerType.Update("Acme", commissionRate, 0.5m));
    }

    [Fact]
    public void Update_WithNegativeItemFee_Throws()
    {
        var sellerType = SellerType.Create("sellertype-1", "Acme", 10m, 0.5m);

        Assert.Throws<ArgumentOutOfRangeException>(() => sellerType.Update("Acme", 10m, -0.01m));
    }

    [Fact]
    public void Update_WithValidData_UpdatesAllPropertiesAndTrimsName()
    {
        var sellerType = SellerType.Create("sellertype-1", "Acme", 10m, 0.5m);

        sellerType.Update("  Acme Deluxe  ", 20m, 1.5m);

        Assert.Equal("Acme Deluxe", sellerType.Name);
        Assert.Equal(20m, sellerType.CommissionRate);
        Assert.Equal(1.5m, sellerType.ItemFee);
    }

    [Fact]
    public void Update_DoesNotChangeIdAfterFieldsChange()
    {
        var sellerType = SellerType.Create("sellertype-1", "Acme", 10m, 0.5m);

        sellerType.Update("Acme Deluxe", 20m, 1.5m);

        Assert.Equal("sellertype-1", sellerType.Id);
    }
}
