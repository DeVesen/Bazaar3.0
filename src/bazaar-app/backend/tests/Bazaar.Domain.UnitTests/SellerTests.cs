using Bazaar.Domain.Sellers;

namespace Bazaar.Domain.UnitTests;

public class SellerTests
{
    private static Seller CreateValidSeller() =>
        Seller.Create(
            "seller-1",
            "Anna",
            "Meier",
            "Hauptstr. 1",
            "76133",
            "Karlsruhe",
            "0721 123456",
            "anna@example.org",
            "sellertype-1",
            10m,
            0.5m);

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceId_Throws(string id)
    {
        Assert.Throws<ArgumentException>(() =>
            Seller.Create(id, "Anna", "Meier", null, null, null, null, "anna@example.org", "sellertype-1", 10m, 0.5m));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceFirstName_Throws(string firstName)
    {
        Assert.Throws<ArgumentException>(() =>
            Seller.Create("seller-1", firstName, "Meier", null, null, null, null, "anna@example.org", "sellertype-1", 10m, 0.5m));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceLastName_Throws(string lastName)
    {
        Assert.Throws<ArgumentException>(() =>
            Seller.Create("seller-1", "Anna", lastName, null, null, null, null, "anna@example.org", "sellertype-1", 10m, 0.5m));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceEmail_Throws(string email)
    {
        Assert.Throws<ArgumentException>(() =>
            Seller.Create("seller-1", "Anna", "Meier", null, null, null, null, email, "sellertype-1", 10m, 0.5m));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceSellerTypeId_Throws(string sellerTypeId)
    {
        Assert.Throws<ArgumentException>(() =>
            Seller.Create("seller-1", "Anna", "Meier", null, null, null, null, "anna@example.org", sellerTypeId, 10m, 0.5m));
    }

    [Fact]
    public void Create_WithOptionalFieldsNull_Succeeds()
    {
        var seller = Seller.Create(
            "seller-1", "Anna", "Meier", null, null, null, null, "anna@example.org", "sellertype-1", 10m, 0.5m);

        Assert.Null(seller.Address);
        Assert.Null(seller.PostalCode);
        Assert.Null(seller.City);
        Assert.Null(seller.Phone);
    }

    [Fact]
    public void Create_WithValidData_SetsAllPropertiesAndTrimsRequiredFields()
    {
        var seller = Seller.Create(
            "seller-1", "  Anna  ", "  Meier  ", "Hauptstr. 1", "76133", "Karlsruhe", "0721 123456",
            "  anna@example.org  ", "sellertype-1", 10m, 0.5m);

        Assert.Equal("seller-1", seller.Id);
        Assert.Equal("Anna", seller.FirstName);
        Assert.Equal("Meier", seller.LastName);
        Assert.Equal("Hauptstr. 1", seller.Address);
        Assert.Equal("76133", seller.PostalCode);
        Assert.Equal("Karlsruhe", seller.City);
        Assert.Equal("0721 123456", seller.Phone);
        Assert.Equal("anna@example.org", seller.Email);
        Assert.Equal("sellertype-1", seller.SellerTypeId);
        Assert.Equal(10m, seller.SalesCommission);
        Assert.Equal(0.5m, seller.FeePerItem);
    }

    [Fact]
    public void Create_DefaultsIntakeFeePaidToZeroAndSettlementFieldsToNull()
    {
        var seller = CreateValidSeller();

        Assert.Equal(0m, seller.IntakeFeePaid);
        Assert.Null(seller.SettledAt);
        Assert.Null(seller.PayoutAmount);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void UpdateDetails_WithEmptyOrWhitespaceFirstName_Throws(string firstName)
    {
        var seller = CreateValidSeller();

        Assert.Throws<ArgumentException>(() =>
            seller.UpdateDetails(firstName, "Meier", null, null, null, null, "anna@example.org", "sellertype-1"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void UpdateDetails_WithEmptyOrWhitespaceEmail_Throws(string email)
    {
        var seller = CreateValidSeller();

        Assert.Throws<ArgumentException>(() =>
            seller.UpdateDetails("Anna", "Meier", null, null, null, null, email, "sellertype-1"));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void UpdateDetails_WithEmptyOrWhitespaceSellerTypeId_Throws(string sellerTypeId)
    {
        var seller = CreateValidSeller();

        Assert.Throws<ArgumentException>(() =>
            seller.UpdateDetails("Anna", "Meier", null, null, null, null, "anna@example.org", sellerTypeId));
    }

    [Fact]
    public void UpdateDetails_WithValidData_UpdatesFieldsAndTrimsThem()
    {
        var seller = CreateValidSeller();

        seller.UpdateDetails(
            "  Berta  ", "  Schmidt  ", "Nebenstr. 2", "76135", "Karlsruhe", "0721 999999",
            "  berta@example.org  ", "sellertype-2");

        Assert.Equal("Berta", seller.FirstName);
        Assert.Equal("Schmidt", seller.LastName);
        Assert.Equal("Nebenstr. 2", seller.Address);
        Assert.Equal("76135", seller.PostalCode);
        Assert.Equal("Karlsruhe", seller.City);
        Assert.Equal("0721 999999", seller.Phone);
        Assert.Equal("berta@example.org", seller.Email);
        Assert.Equal("sellertype-2", seller.SellerTypeId);
    }

    [Fact]
    public void UpdateDetails_DoesNotChangeConditionsOrId()
    {
        var seller = CreateValidSeller();

        seller.UpdateDetails("Berta", "Schmidt", null, null, null, null, "berta@example.org", "sellertype-2");

        Assert.Equal("seller-1", seller.Id);
        Assert.Equal(10m, seller.SalesCommission);
        Assert.Equal(0.5m, seller.FeePerItem);
    }

    [Fact]
    public void UpdateConditions_UpdatesSalesCommissionAndFeePerItem()
    {
        var seller = CreateValidSeller();

        seller.UpdateConditions(20m, 1.5m);

        Assert.Equal(20m, seller.SalesCommission);
        Assert.Equal(1.5m, seller.FeePerItem);
    }

    [Fact]
    public void UpdateConditions_DoesNotChangeDetailsFields()
    {
        var seller = CreateValidSeller();

        seller.UpdateConditions(20m, 1.5m);

        Assert.Equal("Anna", seller.FirstName);
        Assert.Equal("Meier", seller.LastName);
    }

    [Fact]
    public void Settle_SetsPayoutAmountAndSettledAt()
    {
        var seller = CreateValidSeller();
        var settledAt = new DateTimeOffset(2026, 9, 18, 10, 0, 0, TimeSpan.Zero);

        seller.Settle(123.45m, settledAt);

        Assert.Equal(123.45m, seller.PayoutAmount);
        Assert.Equal(settledAt, seller.SettledAt);
    }

    [Fact]
    public void ResetSettlement_ClearsPayoutAmountAndSettledAt()
    {
        var seller = CreateValidSeller();
        seller.Settle(123.45m, new DateTimeOffset(2026, 9, 18, 10, 0, 0, TimeSpan.Zero));

        seller.ResetSettlement();

        Assert.Null(seller.PayoutAmount);
        Assert.Null(seller.SettledAt);
    }

    [Fact]
    public void ResetSettlement_WhenNotSettled_StaysNull()
    {
        var seller = CreateValidSeller();

        seller.ResetSettlement();

        Assert.Null(seller.PayoutAmount);
        Assert.Null(seller.SettledAt);
    }

    [Fact]
    public void AddIntakeFeePaid_AddsToExistingValue()
    {
        var seller = CreateValidSeller();

        seller.AddIntakeFeePaid(6.00m);
        seller.AddIntakeFeePaid(3.50m);

        Assert.Equal(9.50m, seller.IntakeFeePaid);
    }

    [Fact]
    public void AddIntakeFeePaid_WithNegativeAmount_Throws()
    {
        var seller = CreateValidSeller();

        Assert.Throws<ArgumentException>(() => seller.AddIntakeFeePaid(-1m));
    }

    [Fact]
    public void AddIntakeFeePaid_WithZero_Succeeds()
    {
        var seller = CreateValidSeller();

        seller.AddIntakeFeePaid(0m);

        Assert.Equal(0m, seller.IntakeFeePaid);
    }
}
