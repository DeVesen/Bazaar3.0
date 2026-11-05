using Bazaar.Domain.BlankLabels;

namespace Bazaar.Domain.UnitTests;

public class LabelPrintDefaultsTests
{
    private static readonly LabelGraphic StarIcon = new(LabelGraphicKind.Icon, "star");
    private static readonly LabelGraphic PngImage = new(LabelGraphicKind.Image, "data:image/png;base64,AAAA");

    [Fact]
    public void CreateInitial_Always_HasEuroAndNoGraphics()
    {
        // Arrange & Act
        var defaults = LabelPrintDefaults.CreateInitial();

        // Assert
        Assert.Equal(LabelPrintDefaults.FixedId, defaults.Id);
        Assert.Equal("€", defaults.CurrencySymbol);
        Assert.Null(defaults.Logo);
        Assert.Null(defaults.SellerSymbol);
    }

    [Fact]
    public void Update_LogoSymbolAndDollar_StoresAllThree()
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();

        // Act
        defaults.Update(PngImage, StarIcon, "$", 21.5m, 5m, 10.5m, 12m);

        // Assert
        Assert.Equal(PngImage, defaults.Logo);
        Assert.Equal(StarIcon, defaults.SellerSymbol);
        Assert.Equal("$", defaults.CurrencySymbol);
    }

    [Fact]
    public void Update_NoGraphics_ClearsLogoAndSymbol()
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();
        defaults.Update(PngImage, StarIcon, "€", 21.5m, 5m, 10.5m, 12m);

        // Act
        defaults.Update(null, null, "€", 21.5m, 5m, 10.5m, 12m);

        // Assert
        Assert.Null(defaults.Logo);
        Assert.Null(defaults.SellerSymbol);
    }

    [Theory]
    [InlineData("")]
    [InlineData("EURO")]
    public void Update_CurrencyOutsideOneToThreeCharacters_Throws(string currencySymbol)
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => defaults.Update(null, null, currencySymbol, 21.5m, 5m, 10.5m, 12m));
    }

    [Fact]
    public void Update_InvalidGraphic_ThrowsAndKeepsValues()
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();
        var gif = new LabelGraphic(LabelGraphicKind.Image, "data:image/gif;base64,AAAA");

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => defaults.Update(gif, null, "€", 21.5m, 5m, 10.5m, 12m));
        Assert.Null(defaults.Logo);
    }

    [Fact]
    public void CreateInitial_Always_HasDefaultElementSizes()
    {
        // Arrange & Act
        var defaults = LabelPrintDefaults.CreateInitial();

        // Assert
        Assert.Equal(21.5m, defaults.QrCodeSize);
        Assert.Equal(5m, defaults.SellerSymbolSize);
        Assert.Equal(10.5m, defaults.NumberHeight);
        Assert.Equal(12m, defaults.CurrencyHeight);
    }

    [Fact]
    public void Update_ElementSizes_StoresAllFour()
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();

        // Act
        defaults.Update(null, null, "€", qrCodeSize: 25m, sellerSymbolSize: 0.1m, numberHeight: 100m, currencyHeight: 8.5m);

        // Assert
        Assert.Equal(25m, defaults.QrCodeSize);
        Assert.Equal(0.1m, defaults.SellerSymbolSize);
        Assert.Equal(100m, defaults.NumberHeight);
        Assert.Equal(8.5m, defaults.CurrencyHeight);
    }

    [Theory]
    [InlineData(0)]
    [InlineData(100.1)]
    [InlineData(1.25)]
    [InlineData(-1)]
    public void Update_SizeOutsideRangeOrTooPrecise_ThrowsAndKeepsValues(decimal size)
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();

        // Act & Assert
        Assert.Throws<ArgumentOutOfRangeException>(() => defaults.Update(null, null, "€", size, 5m, 10.5m, 12m));
        Assert.Throws<ArgumentOutOfRangeException>(() => defaults.Update(null, null, "€", 21.5m, size, 10.5m, 12m));
        Assert.Throws<ArgumentOutOfRangeException>(() => defaults.Update(null, null, "€", 21.5m, 5m, size, 12m));
        Assert.Throws<ArgumentOutOfRangeException>(() => defaults.Update(null, null, "€", 21.5m, 5m, 10.5m, size));
        Assert.Equal(21.5m, defaults.QrCodeSize);
    }

    [Theory]
    [InlineData(0.1, true)]
    [InlineData(100, true)]
    [InlineData(8.5, true)]
    [InlineData(0, false)]
    [InlineData(100.1, false)]
    [InlineData(1.25, false)]
    public void IsValidSize_Value_MatchesRangeAndOneDecimal(decimal size, bool expected)
    {
        // Act
        var valid = LabelPrintDefaults.IsValidSize(size);

        // Assert
        Assert.Equal(expected, valid);
    }
}
