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
            Sizes = LabelElementSizes.Default,
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
        var command = ValidCommand();

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

    [Theory]
    [InlineData(0.1)]
    [InlineData(100)]
    [InlineData(8.5)]
    public void Validate_SizesWithinRange_IsValid(decimal size)
    {
        // Arrange
        var command = ValidCommand();
        command.Sizes = new LabelElementSizes(size, size, size, size);

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_SizesMissing_HasSizesError()
    {
        // Arrange
        var command = ValidCommand();
        command.Sizes = null;

        // Act
        var result = _sut.Validate(command);

        // Assert
        var error = Assert.Single(result.Errors);
        Assert.Equal(nameof(UpdateLabelPrintDefaultsCommand.Sizes), error.PropertyName);
    }

    [Theory]
    [InlineData(UpdateLabelPrintDefaultsCommandValidator.QrCodeKey, 0)]
    [InlineData(UpdateLabelPrintDefaultsCommandValidator.SellerSymbolKey, 100.1)]
    [InlineData(UpdateLabelPrintDefaultsCommandValidator.NumberHeightKey, 1.25)]
    [InlineData(UpdateLabelPrintDefaultsCommandValidator.CurrencyHeightKey, -1)]
    public void Validate_InvalidSize_HasSizeErrorWithRangeMessage(string errorKey, decimal size)
    {
        // Arrange
        var command = ValidCommand();
        command.Sizes = errorKey switch
        {
            UpdateLabelPrintDefaultsCommandValidator.QrCodeKey => LabelElementSizes.Default with { QrCode = size },
            UpdateLabelPrintDefaultsCommandValidator.SellerSymbolKey => LabelElementSizes.Default with { SellerSymbol = size },
            UpdateLabelPrintDefaultsCommandValidator.NumberHeightKey => LabelElementSizes.Default with { NumberHeight = size },
            _ => LabelElementSizes.Default with { CurrencyHeight = size },
        };

        // Act
        var result = _sut.Validate(command);

        // Assert
        var error = Assert.Single(result.Errors);
        Assert.Equal(errorKey, error.PropertyName);
        Assert.Equal(SizeMessage, error.ErrorMessage);
    }

    [Fact]
    public void SizeKeys_Always_NameNestedCamelCaseField()
    {
        // Assert
        Assert.Equal("sizes.qrCode", UpdateLabelPrintDefaultsCommandValidator.QrCodeKey);
        Assert.Equal("sizes.sellerSymbol", UpdateLabelPrintDefaultsCommandValidator.SellerSymbolKey);
        Assert.Equal("sizes.numberHeight", UpdateLabelPrintDefaultsCommandValidator.NumberHeightKey);
        Assert.Equal("sizes.currencyHeight", UpdateLabelPrintDefaultsCommandValidator.CurrencyHeightKey);
    }

    private const string SizeMessage = "Zahl von 0,1 bis 100 mit höchstens 1 Nachkommastelle";

    private static UpdateLabelPrintDefaultsCommand ValidCommand() => new()
    {
        Logo = null,
        SellerSymbol = null,
        CurrencySymbol = "€",
        Sizes = LabelElementSizes.Default,
    };
}
