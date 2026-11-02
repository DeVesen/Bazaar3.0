using Bazaar.Application.BlankLabels;

namespace Bazaar.Application.UnitTests.BlankLabels;

public class SaveLabelSheetFormatCommandValidatorTests
{
    private readonly SaveLabelSheetFormatCommandValidator _sut = new();

    private static SaveLabelSheetFormatCommand Avery16(string name = "Avery 16er") => new()
    {
        Name = name,
        SheetWidth = 210m,
        SheetHeight = 297m,
        LabelWidth = 105m,
        LabelHeight = 35m,
        MarginTop = 8.5m,
        MarginRight = 0m,
        MarginBottom = 8.5m,
        MarginLeft = 0m,
        GapHorizontal = 0m,
        GapVertical = 0m,
        Columns = 2,
        Rows = 8,
    };

    [Fact]
    public void Validate_Avery16_IsValid()
    {
        // Arrange
        var command = Avery16();

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Validate_BlankName_HasNameError(string name)
    {
        // Arrange
        var command = Avery16(name);

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Name));
    }

    [Fact]
    public void Validate_Name51Characters_HasNameError()
    {
        // Arrange
        var command = Avery16(new string('x', 51));

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Name));
    }

    [Fact]
    public void Validate_ThreeColumnsOnA4_HasColumnsError()
    {
        // Arrange
        var command = Avery16();
        command.Columns = 3;

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Columns));
    }

    [Fact]
    public void Validate_MarginTop9_1_HasRowsError()
    {
        // Arrange
        var command = Avery16();
        command.MarginTop = 9.1m;

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Rows));
    }

    [Fact]
    public void Validate_MarginTop8_9_IsValid()
    {
        // Arrange
        var command = Avery16();
        command.MarginTop = 8.9m;

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_ZeroLabelWidth_HasLabelWidthError()
    {
        // Arrange
        var command = Avery16();
        command.LabelWidth = 0m;

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.LabelWidth));
    }

    [Fact]
    public void Validate_TwoDecimals_HasMarginLeftError()
    {
        // Arrange
        var command = Avery16();
        command.MarginLeft = 0.25m;

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.MarginLeft));
    }

    [Fact]
    public void Validate_NegativeMargin_HasMarginBottomError()
    {
        // Arrange
        var command = Avery16();
        command.MarginBottom = -1m;

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.MarginBottom));
    }

    [Fact]
    public void Validate_ZeroColumns_HasColumnsError()
    {
        // Arrange
        var command = Avery16();
        command.Columns = 0;

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.Columns));
    }

    [Fact]
    public void Validate_ExtremeMeasuresAndCounts_ReturnsErrorsInsteadOfOverflowing()
    {
        // Arrange
        var command = Avery16();
        command.LabelWidth = decimal.MaxValue;
        command.GapHorizontal = decimal.MaxValue;
        command.Columns = int.MaxValue;
        command.Rows = int.MaxValue;

        // Act
        var result = _sut.Validate(command);

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SaveLabelSheetFormatCommand.LabelWidth));
    }
}
