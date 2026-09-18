using Bazaar.Application.SellerTypes;

namespace Bazaar.Application.UnitTests.SellerTypes;

public class UpdateSellerTypeCommandValidatorTests
{
    private readonly UpdateSellerTypeCommandValidator _sut = new();

    [Fact]
    public void Validate_EmptyName_HasValidationError()
    {
        var result = _sut.Validate(new UpdateSellerTypeCommand
        { Id = "SELLERTYPE001", Name = "", CommissionRate = 10m, ItemFee = 0.5m });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerTypeCommand.Name));
    }

    [Theory]
    [InlineData(-0.01)]
    [InlineData(100.01)]
    public void Validate_CommissionRateOutOfRange_HasValidationError(decimal commissionRate)
    {
        var result = _sut.Validate(new UpdateSellerTypeCommand
        { Id = "SELLERTYPE001", Name = "Standard", CommissionRate = commissionRate, ItemFee = 0.5m });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerTypeCommand.CommissionRate));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(100)]
    public void Validate_CommissionRateAtBoundary_IsValid(decimal commissionRate)
    {
        var result = _sut.Validate(new UpdateSellerTypeCommand
        { Id = "SELLERTYPE001", Name = "Standard", CommissionRate = commissionRate, ItemFee = 0.5m });

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_NegativeItemFee_HasValidationError()
    {
        var result = _sut.Validate(new UpdateSellerTypeCommand
        { Id = "SELLERTYPE001", Name = "Standard", CommissionRate = 10m, ItemFee = -0.01m });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerTypeCommand.ItemFee));
    }
}
