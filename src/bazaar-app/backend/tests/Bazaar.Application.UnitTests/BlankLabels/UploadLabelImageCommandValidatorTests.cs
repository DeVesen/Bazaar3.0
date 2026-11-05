using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class UploadLabelImageCommandValidatorTests
{
    private const string ValidDataUrl = "data:image/png;base64,AAAA";

    private readonly UploadLabelImageCommandValidator _sut = new();

    [Fact]
    public void Validate_NameAndPng_IsValid()
    {
        // Arrange
        var command = new UploadLabelImageCommand { Name = "Logo", DataUrl = ValidDataUrl };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_NameOf50CharsAfterTrim_IsValid()
    {
        // Arrange
        var command = new UploadLabelImageCommand { Name = $" {new string('x', LabelImage.NameMaxLength)} ", DataUrl = ValidDataUrl };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_BlankName_IsInvalid(string name)
    {
        // Arrange
        var command = new UploadLabelImageCommand { Name = name, DataUrl = ValidDataUrl };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UploadLabelImageCommand.Name));
    }

    [Fact]
    public void Validate_NameLongerThan50_IsInvalid()
    {
        // Arrange
        var command = new UploadLabelImageCommand { Name = new string('x', LabelImage.NameMaxLength + 1), DataUrl = ValidDataUrl };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UploadLabelImageCommand.Name));
    }

    [Theory]
    [InlineData("data:image/gif;base64,AAAA")]
    [InlineData("data:image/png;base64,***")]
    [InlineData("")]
    public void Validate_UnsupportedOrBrokenDataUrl_IsInvalid(string dataUrl)
    {
        // Arrange
        var command = new UploadLabelImageCommand { Name = "Logo", DataUrl = dataUrl };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UploadLabelImageCommand.DataUrl));
    }

    [Fact]
    public void Validate_ImageOver1Mb_IsInvalid()
    {
        // Arrange
        var dataUrl = $"data:image/png;base64,{Convert.ToBase64String(new byte[LabelGraphic.MaxImageBytes + 1])}";
        var command = new UploadLabelImageCommand { Name = "Logo", DataUrl = dataUrl };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UploadLabelImageCommand.DataUrl));
    }
}
