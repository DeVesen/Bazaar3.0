using Bazaar.Application.BlankLabels;
using Bazaar.Domain.BlankLabels;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class UpdateLabelPrintDefaultsCommandValidatorTests
{
    private readonly UpdateLabelPrintDefaultsCommandValidator _sut = new();

    [Fact]
    public void Validate_IconSymbolAndPngLogo_IsValid()
    {
        // Arrange
        var command = new UpdateLabelPrintDefaultsCommand
        {
            Logo = new LabelGraphic(LabelGraphicKind.Image, "data:image/png;base64,AAAA"),
            SellerSymbol = new LabelGraphic(LabelGraphicKind.Icon, "star"),
            CurrencySymbol = "€",
        };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_NoGraphics_IsValid()
    {
        // Arrange
        var command = new UpdateLabelPrintDefaultsCommand { Logo = null, SellerSymbol = null, CurrencySymbol = "€" };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_GifLogo_HasLogoError()
    {
        // Arrange
        var command = new UpdateLabelPrintDefaultsCommand
        {
            Logo = new LabelGraphic(LabelGraphicKind.Image, "data:image/gif;base64,AAAA"),
            CurrencySymbol = "€",
        };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateLabelPrintDefaultsCommand.Logo));
    }

    [Theory]
    [InlineData("")]
    [InlineData("EURO")]
    public void Validate_CurrencyOutsideOneToThreeCharacters_HasCurrencyError(string currencySymbol)
    {
        // Arrange
        var command = new UpdateLabelPrintDefaultsCommand { CurrencySymbol = currencySymbol };

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateLabelPrintDefaultsCommand.CurrencySymbol));
    }
}
