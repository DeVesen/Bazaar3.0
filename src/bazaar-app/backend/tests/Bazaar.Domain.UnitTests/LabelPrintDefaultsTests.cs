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
        defaults.Update(PngImage, StarIcon, "$");

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
        defaults.Update(PngImage, StarIcon, "€");

        // Act
        defaults.Update(null, null, "€");

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
        Assert.ThrowsAny<ArgumentException>(() => defaults.Update(null, null, currencySymbol));
    }

    [Fact]
    public void Update_InvalidGraphic_ThrowsAndKeepsValues()
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();
        var gif = new LabelGraphic(LabelGraphicKind.Image, "data:image/gif;base64,AAAA");

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => defaults.Update(gif, null, "€"));
        Assert.Null(defaults.Logo);
    }
}
