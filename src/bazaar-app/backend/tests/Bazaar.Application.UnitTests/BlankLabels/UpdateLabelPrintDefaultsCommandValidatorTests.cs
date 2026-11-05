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
            QrCodeSize = 21.5m,
            SellerSymbolSize = 5m,
            NumberHeight = 10.5m,
            CurrencyHeight = 12m,
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
        command.QrCodeSize = size;
        command.SellerSymbolSize = size;
        command.NumberHeight = size;
        command.CurrencyHeight = size;

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData(nameof(UpdateLabelPrintDefaultsCommand.QrCodeSize), 0)]
    [InlineData(nameof(UpdateLabelPrintDefaultsCommand.SellerSymbolSize), 100.1)]
    [InlineData(nameof(UpdateLabelPrintDefaultsCommand.NumberHeight), 1.25)]
    [InlineData(nameof(UpdateLabelPrintDefaultsCommand.CurrencyHeight), -1)]
    public void Validate_InvalidSize_HasSizeErrorWithRangeMessage(string propertyName, decimal size)
    {
        // Arrange
        var command = ValidCommand();
        typeof(UpdateLabelPrintDefaultsCommand).GetProperty(propertyName)!.SetValue(command, size);

        // Act
        var result = _sut.Validate(command);

        // Assert
        var error = Assert.Single(result.Errors);
        Assert.Equal(propertyName, error.PropertyName);
        Assert.Equal(SizeMessage, error.ErrorMessage);
    }

    private const string SizeMessage = "Zahl von 0,1 bis 100 mit höchstens 1 Nachkommastelle";

    private static UpdateLabelPrintDefaultsCommand ValidCommand() => new()
    {
        Logo = null,
        SellerSymbol = null,
        CurrencySymbol = "€",
        QrCodeSize = 21.5m,
        SellerSymbolSize = 5m,
        NumberHeight = 10.5m,
        CurrencyHeight = 12m,
    };
}
