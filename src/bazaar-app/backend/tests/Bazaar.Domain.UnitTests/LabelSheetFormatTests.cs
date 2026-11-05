using Bazaar.Domain.BlankLabels;

namespace Bazaar.Domain.UnitTests;

public class LabelSheetFormatTests
{
    private static LabelSheetGeometry Avery16() =>
        new(210m, 297m, 105m, 35m, 8.5m, 0m, 8.5m, 0m, 0m, 0m, 2, 8, 0m, 0m);

    private static LabelSheetGeometry InvalidGeometry(string caseName) => caseName switch
    {
        "zero-label-width" => Avery16() with { LabelWidth = 0m },
        "zero-sheet-height" => Avery16() with { SheetHeight = 0m },
        "two-decimals" => Avery16() with { MarginLeft = 0.25m },
        "negative-margin" => Avery16() with { MarginTop = -1m },
        "zero-columns" => Avery16() with { Columns = 0 },
        "zero-rows" => Avery16() with { Rows = 0 },
        "offset-x-beyond-20" => Avery16() with { OffsetX = 20.1m },
        "offset-y-beyond-minus-20" => Avery16() with { OffsetY = -20.1m },
        "offset-two-decimals" => Avery16() with { OffsetX = 1.25m },
        _ => throw new ArgumentOutOfRangeException(nameof(caseName)),
    };

    [Fact]
    public void Create_Avery16WithPaddedName_TrimsNameAndKeepsGeometry()
    {
        // Arrange
        var geometry = Avery16();

        // Act
        var format = LabelSheetFormat.Create("LSF00001", "  Avery 16er  ", geometry);

        // Assert
        Assert.Equal("LSF00001", format.Id);
        Assert.Equal("Avery 16er", format.Name);
        Assert.Equal(geometry, format.Geometry);
    }

    [Fact]
    public void Create_ThreeColumnsOf105OnA4_Throws()
    {
        // Arrange
        var geometry = Avery16() with { Columns = 3 };

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", "Zu breit", geometry));
    }

    [Fact]
    public void Create_MarginTop8_9WithinTolerance_Succeeds()
    {
        // Arrange
        var geometry = Avery16() with { MarginTop = 8.9m };

        // Act
        var format = LabelSheetFormat.Create("LSF00001", "Toleranz", geometry);

        // Assert
        Assert.Equal(8.9m, format.Geometry.MarginTop);
    }

    [Fact]
    public void Create_MarginTop9_1BeyondTolerance_Throws()
    {
        // Arrange
        var geometry = Avery16() with { MarginTop = 9.1m };

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", "Zu hoch", geometry));
    }

    [Theory]
    [InlineData("zero-label-width")]
    [InlineData("zero-sheet-height")]
    [InlineData("two-decimals")]
    [InlineData("negative-margin")]
    [InlineData("zero-columns")]
    [InlineData("zero-rows")]
    [InlineData("offset-x-beyond-20")]
    [InlineData("offset-y-beyond-minus-20")]
    [InlineData("offset-two-decimals")]
    public void Create_InvalidMeasure_Throws(string caseName)
    {
        // Arrange
        var geometry = InvalidGeometry(caseName);

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", "Ungültig", geometry));
    }

    [Fact]
    public void Create_ZeroMarginsAndGaps_Succeeds()
    {
        // Arrange
        var geometry = Avery16() with { MarginTop = 0m, MarginBottom = 0m };

        // Act
        var format = LabelSheetFormat.Create("LSF00001", "Ohne Rand", geometry);

        // Assert
        Assert.Equal(0m, format.Geometry.MarginTop);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_BlankName_Throws(string name)
    {
        // Arrange
        var geometry = Avery16();

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", name, geometry));
    }

    [Fact]
    public void Create_Name51Characters_Throws()
    {
        // Arrange
        var name = new string('x', 51);

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => LabelSheetFormat.Create("LSF00001", name, Avery16()));
    }

    [Fact]
    public void Create_Name50CharactersWithPadding_Succeeds()
    {
        // Arrange
        var name = "  " + new string('x', 50) + "  ";

        // Act
        var format = LabelSheetFormat.Create("LSF00001", name, Avery16());

        // Assert
        Assert.Equal(50, format.Name.Length);
    }

    [Fact]
    public void ReplaceGeometry_ValidGeometry_ReplacesGeometry()
    {
        // Arrange
        var format = LabelSheetFormat.Create("LSF00001", "Avery 12er", Avery16());
        var avery12 = new LabelSheetGeometry(210m, 297m, 105m, 48m, 4.5m, 0m, 4.5m, 0m, 0m, 0m, 2, 6, 0m, 0m);

        // Act
        format.ReplaceGeometry(avery12);

        // Assert
        Assert.Equal(avery12, format.Geometry);
    }

    [Fact]
    public void ReplaceGeometry_NotFitting_ThrowsAndKeepsGeometry()
    {
        // Arrange
        var format = LabelSheetFormat.Create("LSF00001", "Avery 16er", Avery16());

        // Act & Assert
        Assert.ThrowsAny<ArgumentException>(() => format.ReplaceGeometry(Avery16() with { Rows = 9 }));
        Assert.Equal(8, format.Geometry.Rows);
    }

    [Theory]
    [InlineData(-20, 20)]
    [InlineData(20, -20)]
    [InlineData(-2.5, 3)]
    public void Create_OffsetWithinRange_KeepsOffset(decimal offsetX, decimal offsetY)
    {
        // Arrange
        var geometry = Avery16() with { OffsetX = offsetX, OffsetY = offsetY };

        // Act
        var format = LabelSheetFormat.Create("LSF00001", "Versatz", geometry);

        // Assert
        Assert.Equal(offsetX, format.Geometry.OffsetX);
        Assert.Equal(offsetY, format.Geometry.OffsetY);
    }

    [Theory]
    [InlineData(-20)]
    [InlineData(20)]
    public void FitsSheet_FlushFittingFormatWithMaxOffset_StillFits(decimal offset)
    {
        // Arrange
        var geometry = Avery16() with { OffsetX = offset, OffsetY = offset };

        // Act
        var fitsWidth = geometry.FitsSheetWidth();
        var fitsHeight = geometry.FitsSheetHeight();

        // Assert
        Assert.True(fitsWidth);
        Assert.True(fitsHeight);
    }

    [Fact]
    public void FitsSheetWidth_TooWideFormatWithNegativeOffset_StillDoesNotFit()
    {
        // Arrange
        var geometry = Avery16() with { Columns = 3, OffsetX = -20m };

        // Act
        var fits = geometry.FitsSheetWidth();

        // Assert
        Assert.False(fits);
    }
}
