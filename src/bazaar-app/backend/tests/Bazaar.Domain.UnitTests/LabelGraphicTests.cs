using Bazaar.Domain.BlankLabels;

namespace Bazaar.Domain.UnitTests;

public class LabelGraphicTests
{
    private static string DataUrl(string mediaType, int byteCount) =>
        $"data:{mediaType};base64,{Convert.ToBase64String(new byte[byteCount])}";

    [Theory]
    [InlineData("star")]
    [InlineData("flower")]
    public void IsValid_KnownIconKeyFormat_ReturnsTrue(string iconKey)
    {
        // Arrange
        var graphic = new LabelGraphic(LabelGraphicKind.Icon, iconKey);

        // Act
        var valid = graphic.IsValid();

        // Assert
        Assert.True(valid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("Star!")]
    public void IsValid_MalformedIconKey_ReturnsFalse(string iconKey)
    {
        // Arrange
        var graphic = new LabelGraphic(LabelGraphicKind.Icon, iconKey);

        // Act
        var valid = graphic.IsValid();

        // Assert
        Assert.False(valid);
    }

    [Theory]
    [InlineData("image/png")]
    [InlineData("image/jpeg")]
    [InlineData("image/svg+xml")]
    public void IsValid_AllowedImageTypeUpTo1Mb_ReturnsTrue(string mediaType)
    {
        // Arrange
        var graphic = new LabelGraphic(LabelGraphicKind.Image, DataUrl(mediaType, LabelGraphic.MaxImageBytes));

        // Act
        var valid = graphic.IsValid();

        // Assert
        Assert.True(valid);
    }

    [Fact]
    public void IsValid_GifImage_ReturnsFalse()
    {
        // Arrange
        var graphic = new LabelGraphic(LabelGraphicKind.Image, DataUrl("image/gif", 10));

        // Act
        var valid = graphic.IsValid();

        // Assert
        Assert.False(valid);
    }

    [Fact]
    public void IsValid_PngOver1Mb_ReturnsFalse()
    {
        // Arrange
        var graphic = new LabelGraphic(LabelGraphicKind.Image, DataUrl("image/png", LabelGraphic.MaxImageBytes + 1));

        // Act
        var valid = graphic.IsValid();

        // Assert
        Assert.False(valid);
    }

    [Theory]
    [InlineData("data:image/png;base64,###")]
    [InlineData("https://example.com/logo.png")]
    [InlineData("data:image/png,rohdaten")]
    public void IsValid_NoBase64DataUrl_ReturnsFalse(string value)
    {
        // Arrange
        var graphic = new LabelGraphic(LabelGraphicKind.Image, value);

        // Act
        var valid = graphic.IsValid();

        // Assert
        Assert.False(valid);
    }
}
