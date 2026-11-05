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
        defaults.Update(PngImage, StarIcon, "$", LabelElementSizes.Default);

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
        defaults.Update(PngImage, StarIcon, "€", LabelElementSizes.Default);

        // Act
        defaults.Update(null, null, "€", LabelElementSizes.Default);

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
        Assert.ThrowsAny<ArgumentException>(() => defaults.Update(null, null, currencySymbol, LabelElementSizes.Default));
    }

    [Fact]
    public void Update_InvalidGraphic_ThrowsAndKeepsValues()
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();
        var gif = new LabelGraphic(LabelGraphicKind.Image, "data:image/gif;base64,AAAA");

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => defaults.Update(gif, null, "€", LabelElementSizes.Default));
        Assert.Null(defaults.Logo);
    }

    [Fact]
    public void CreateInitial_Always_HasDefaultElementSizes()
    {
        // Arrange & Act
        var defaults = LabelPrintDefaults.CreateInitial();

        // Assert
        Assert.Equal(LabelElementSizes.Default, defaults.Sizes);
    }

    [Fact]
    public void Update_ElementSizes_StoresAllFour()
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();
        var sizes = new LabelElementSizes(QrCode: 25m, SellerSymbol: 0.1m, NumberHeight: 100m, CurrencyHeight: 8.5m);

        // Act
        defaults.Update(null, null, "€", sizes);

        // Assert
        Assert.Equal(sizes, defaults.Sizes);
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
        var valid = LabelElementSizes.Default;

        // Act & Assert
        Assert.Throws<ArgumentOutOfRangeException>(() => defaults.Update(null, null, "€", valid with { QrCode = size }));
        Assert.Throws<ArgumentOutOfRangeException>(() => defaults.Update(null, null, "€", valid with { SellerSymbol = size }));
        Assert.Throws<ArgumentOutOfRangeException>(() => defaults.Update(null, null, "€", valid with { NumberHeight = size }));
        Assert.Throws<ArgumentOutOfRangeException>(() => defaults.Update(null, null, "€", valid with { CurrencyHeight = size }));
        Assert.Equal(LabelElementSizes.Default, defaults.Sizes);
    }

    [Fact]
    public void Update_NullSizes_ThrowsAndKeepsValues()
    {
        // Arrange
        var defaults = LabelPrintDefaults.CreateInitial();

        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => defaults.Update(null, null, "$", null!));
        Assert.Equal("€", defaults.CurrencySymbol);
    }
}
