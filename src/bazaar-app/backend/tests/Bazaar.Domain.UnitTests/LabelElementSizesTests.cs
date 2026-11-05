using Bazaar.Domain.BlankLabels;

namespace Bazaar.Domain.UnitTests;

public class LabelElementSizesTests
{
    [Fact]
    public void Default_Always_HasPresetSizesInMm()
    {
        // Arrange & Act
        var sizes = LabelElementSizes.Default;

        // Assert
        Assert.Equal(21.5m, sizes.QrCode);
        Assert.Equal(5m, sizes.SellerSymbol);
        Assert.Equal(10.5m, sizes.NumberHeight);
        Assert.Equal(12m, sizes.CurrencyHeight);
    }

    [Theory]
    [InlineData(0.1, true)]
    [InlineData(100, true)]
    [InlineData(8.5, true)]
    [InlineData(0, false)]
    [InlineData(-1, false)]
    [InlineData(100.1, false)]
    [InlineData(1.25, false)]
    public void IsValidSize_Value_MatchesRangeAndOneDecimal(decimal size, bool expected)
    {
        // Act
        var valid = LabelElementSizes.IsValidSize(size);

        // Assert
        Assert.Equal(expected, valid);
    }

    [Fact]
    public void IsValid_AllSizesWithinRange_IsTrue()
    {
        // Arrange
        var sizes = new LabelElementSizes(QrCode: 0.1m, SellerSymbol: 100m, NumberHeight: 8.5m, CurrencyHeight: 12m);

        // Act
        var valid = sizes.IsValid();

        // Assert
        Assert.True(valid);
    }

    [Theory]
    [InlineData(0, 5, 10.5, 12)]
    [InlineData(21.5, 100.1, 10.5, 12)]
    [InlineData(21.5, 5, 1.25, 12)]
    [InlineData(21.5, 5, 10.5, -1)]
    public void IsValid_OneSizeInvalid_IsFalse(decimal qrCode, decimal sellerSymbol, decimal numberHeight, decimal currencyHeight)
    {
        // Arrange
        var sizes = new LabelElementSizes(qrCode, sellerSymbol, numberHeight, currencyHeight);

        // Act
        var valid = sizes.IsValid();

        // Assert
        Assert.False(valid);
    }
}
