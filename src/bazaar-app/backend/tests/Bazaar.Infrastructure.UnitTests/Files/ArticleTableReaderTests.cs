using System.Text;
using Bazaar.Domain.Exceptions;
using Bazaar.Infrastructure.Files;
using ClosedXML.Excel;

namespace Bazaar.Infrastructure.UnitTests.Files;

public class ArticleTableReaderTests
{
    private static MemoryStream Utf8(string text) => new(Encoding.UTF8.GetBytes(text));

    private static MemoryStream Workbook(Action<IXLWorkbook> build)
    {
        using var workbook = new XLWorkbook();
        build(workbook);
        var stream = new MemoryStream();
        workbook.SaveAs(stream);
        stream.Position = 0;
        return stream;
    }

    [Fact]
    public void ReadRows_CsvWithBlankLine_KeepsBlankRowAtItsPosition()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Utf8("Nr;Name\n1;Jacke\n\n2;Hose\n");

        // Act
        var rows = sut.ReadRows(stream, "artikel.csv");

        // Assert
        Assert.Equal(4, rows.Count);
        Assert.Empty(rows[2]);
        Assert.Equal("2", rows[3][0]);
    }

    [Fact]
    public void ReadRows_CsvWithQuotedSeparatorAndEscapedQuote_ReturnsUnquotedText()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Utf8("1;\"Ski; Jacke \"\"XL\"\"\"\n");

        // Act
        var rows = sut.ReadRows(stream, "artikel.csv");

        // Assert
        Assert.Equal("Ski; Jacke \"XL\"", rows[0][1]);
    }

    [Fact]
    public void ReadRows_CsvWithEmptyField_ReturnsNullForThatCell()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Utf8("1;Jacke;;Icepeak\n");

        // Act
        var rows = sut.ReadRows(stream, "artikel.csv");

        // Assert
        Assert.Null(rows[0][2]);
    }

    [Fact]
    public void ReadRows_CsvInLatin1_DecodesUmlauts()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = new MemoryStream(Encoding.Latin1.GetBytes("1;Größe\n"));

        // Act
        var rows = sut.ReadRows(stream, "artikel.csv");

        // Assert
        Assert.Equal("Größe", rows[0][1]);
    }

    [Fact]
    public void ReadRows_CsvWithUtf8Bom_IgnoresBom()
    {
        // Arrange
        var sut = new ArticleTableReader();
        var bytes = Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes("Nr;Name\n")).ToArray();
        using var stream = new MemoryStream(bytes);

        // Act
        var rows = sut.ReadRows(stream, "artikel.csv");

        // Assert
        Assert.Equal("Nr", rows[0][0]);
    }

    [Fact]
    public void ReadRows_XlsxWithGapRow_KeepsRowPositionsAndReturnsNumbersAsDouble()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Workbook(book =>
        {
            var sheet = book.AddWorksheet("Artikel");
            sheet.Cell(1, 1).Value = "Nr";
            sheet.Cell(2, 1).Value = 3001;
            sheet.Cell(2, 2).Value = "Jacke";
            sheet.Cell(4, 1).Value = 3002;
        });

        // Act
        var rows = sut.ReadRows(stream, "artikel.xlsx");

        // Assert
        Assert.Equal(4, rows.Count);
        Assert.Equal(3001d, rows[1][0]);
        Assert.Equal("Jacke", rows[1][1]);
        Assert.Equal(3002d, rows[3][0]);
    }

    [Fact]
    public void ReadRows_XlsxWithGapRow_ReturnsNullCellsForGapRow()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Workbook(book =>
        {
            var sheet = book.AddWorksheet("Artikel");
            sheet.Cell(1, 1).Value = "Nr";
            sheet.Cell(4, 1).Value = 3002;
        });

        // Act
        var rows = sut.ReadRows(stream, "artikel.xlsx");

        // Assert
        Assert.All(rows[2], cell => Assert.Null(cell));
    }

    [Fact]
    public void ReadRows_XlsxWithTwoSheets_ReadsOnlyFirstSheet()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Workbook(book =>
        {
            book.AddWorksheet("Erstes").Cell(1, 1).Value = "Nr";
            book.AddWorksheet("Zweites").Cell(1, 1).Value = "nie gelesen";
        });

        // Act
        var rows = sut.ReadRows(stream, "artikel.xlsx");

        // Assert
        Assert.Single(rows);
    }

    [Fact]
    public void ReadRows_XlsxCorruptContent_ThrowsUnreadableFile()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Utf8("das ist keine Tabelle");

        // Act & Assert
        var exception = Assert.Throws<BadRequestException>(() => sut.ReadRows(stream, "artikel.xlsx"));
        Assert.Equal("import.unreadable_file", exception.ErrorCode);
    }

    [Fact]
    public void ReadRows_XlsCorruptContent_ThrowsUnreadableFile()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Utf8("das ist keine Tabelle");

        // Act & Assert
        var exception = Assert.Throws<BadRequestException>(() => sut.ReadRows(stream, "artikel.xls"));
        Assert.Equal("import.unreadable_file", exception.ErrorCode);
    }

    [Fact]
    public void ReadRows_XlsxWithMoreRowsThanLimit_ThrowsUnreadableFile()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Workbook(book =>
        {
            var sheet = book.AddWorksheet("Artikel");
            sheet.Cell(1, 1).Value = "Nr";
            sheet.Cell(ArticleTableReader.MaxRows + 1, 1).Value = 3001;
        });

        // Act & Assert
        var exception = Assert.Throws<BadRequestException>(() => sut.ReadRows(stream, "artikel.xlsx"));
        Assert.Equal("import.unreadable_file", exception.ErrorCode);
    }

    [Fact]
    public void ReadRows_XlsxWithMoreRowsThanLimit_NamesLimitFromConstantInMessage()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Workbook(book =>
        {
            var sheet = book.AddWorksheet("Artikel");
            sheet.Cell(ArticleTableReader.MaxRows + 1, 1).Value = 3001;
        });

        // Act & Assert
        var exception = Assert.Throws<BadRequestException>(() => sut.ReadRows(stream, "artikel.xlsx"));
        Assert.Equal("Die Datei konnte nicht gelesen werden (mehr als 100.000 Zeilen)", exception.Message);
    }

    [Fact]
    public void ReadRows_XlsxWithMoreColumnsThanParserNeeds_ReturnsOnlyFirstSixCells()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Workbook(book =>
        {
            var sheet = book.AddWorksheet("Artikel");
            for (var column = 1; column <= 20; column++)
            {
                sheet.Cell(2, column).Value = column;
            }
        });

        // Act
        var rows = sut.ReadRows(stream, "artikel.xlsx");

        // Assert
        Assert.Equal(ArticleTableReader.MaxColumns, rows[1].Count);
        Assert.Equal(6d, rows[1][5]);
    }

    [Fact]
    public void ReadRows_PdfExtension_ThrowsInvalidFileType()
    {
        // Arrange
        var sut = new ArticleTableReader();
        using var stream = Utf8("%PDF");

        // Act & Assert
        var exception = Assert.Throws<BadRequestException>(() => sut.ReadRows(stream, "artikel.pdf"));
        Assert.Equal("import.invalid_file_type", exception.ErrorCode);
    }
}
