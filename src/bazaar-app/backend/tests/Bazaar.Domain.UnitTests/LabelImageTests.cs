using System.Security.Cryptography;
using Bazaar.Domain.BlankLabels;

namespace Bazaar.Domain.UnitTests;

public class LabelImageTests
{
    private static readonly DateTimeOffset CreatedAt = new(2026, 11, 5, 10, 0, 0, TimeSpan.Zero);

    private static string DataUrl(string mediaType, byte[] bytes) =>
        $"data:{mediaType};base64,{Convert.ToBase64String(bytes)}";

    [Theory]
    [InlineData("image/png")]
    [InlineData("image/jpeg")]
    [InlineData("image/svg+xml")]
    public void Create_AllowedMediaType_SetsMediaTypeSizeAndHash(string mediaType)
    {
        // Arrange
        var bytes = new byte[] { 1, 2, 3, 4, 5 };

        // Act
        var image = LabelImage.Create("LIM00001", "Logo", DataUrl(mediaType, bytes), CreatedAt);

        // Assert
        Assert.Equal("LIM00001", image.Id);
        Assert.Equal(mediaType, image.MediaType);
        Assert.Equal(5, image.SizeBytes);
        Assert.Equal(Convert.ToHexStringLower(SHA256.HashData(bytes)), image.ContentHash);
        Assert.Equal(CreatedAt, image.CreatedAt);
    }

    [Fact]
    public void Create_PaddedName_TrimsName()
    {
        // Arrange
        var dataUrl = DataUrl("image/png", [1]);

        // Act
        var image = LabelImage.Create("LIM00001", "  Mein Logo  ", dataUrl, CreatedAt);

        // Assert
        Assert.Equal("Mein Logo", image.Name);
    }

    [Fact]
    public void Create_SameBytesDifferentName_HasSameHash()
    {
        // Arrange
        var dataUrl = DataUrl("image/png", [9, 9, 9]);

        // Act
        var first = LabelImage.Create("LIM00001", "A", dataUrl, CreatedAt);
        var second = LabelImage.Create("LIM00002", "B", dataUrl, CreatedAt);

        // Assert
        Assert.Equal(first.ContentHash, second.ContentHash);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_BlankName_Throws(string name)
    {
        // Arrange
        var dataUrl = DataUrl("image/png", [1]);

        // Act
        var act = () => LabelImage.Create("LIM00001", name, dataUrl, CreatedAt);

        // Assert
        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Create_NameLongerThan50_Throws()
    {
        // Arrange
        var dataUrl = DataUrl("image/png", [1]);

        // Act
        var act = () => LabelImage.Create("LIM00001", new string('x', LabelImage.NameMaxLength + 1), dataUrl, CreatedAt);

        // Assert
        Assert.Throws<ArgumentOutOfRangeException>(act);
    }

    [Theory]
    [InlineData("data:image/gif;base64,AAAA")]
    [InlineData("data:image/png;base64,***")]
    [InlineData("not a data url")]
    public void Create_InvalidDataUrl_Throws(string dataUrl)
    {
        // Act
        var act = () => LabelImage.Create("LIM00001", "Logo", dataUrl, CreatedAt);

        // Assert
        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void Create_ImageOver1Mb_Throws()
    {
        // Arrange
        var dataUrl = DataUrl("image/png", new byte[LabelGraphic.MaxImageBytes + 1]);

        // Act
        var act = () => LabelImage.Create("LIM00001", "Logo", dataUrl, CreatedAt);

        // Assert
        Assert.Throws<ArgumentException>(act);
    }

    [Fact]
    public void ComputeContentHash_ValidDataUrl_MatchesCreatedImage()
    {
        // Arrange
        var dataUrl = DataUrl("image/jpeg", [7, 8]);
        var image = LabelImage.Create("LIM00001", "Logo", dataUrl, CreatedAt);

        // Act
        var hash = LabelImage.ComputeContentHash(dataUrl);

        // Assert
        Assert.Equal(image.ContentHash, hash);
    }
}
