using System.Globalization;
using Bazaar.Application.ArticleImport;

namespace Bazaar.Application.UnitTests.ArticleImport;

public class ArticleTableParserTests
{
    private static readonly CultureInfo German = CultureInfo.GetCultureInfo("de-DE");
    private static readonly object?[] Header = Row("Nr", "Bezeichnung", "Kategorie", "Marke", "Gr\u00f6\u00dfe", "Preis");

    private static object?[] Row(params object?[] cells) => cells;

    private static object?[] Valid(string number) =>
        Row(number, "Jacke", "Ski Jacke", "Icepeak", "128", "25");

    private static IReadOnlyList<IReadOnlyList<object?>> Table(params object?[][] rows) => rows;

    [Fact]
    public void Parse_HeaderAndThreeValidRows_ReturnsThreeLinesWithoutErrors()
    {
        // Arrange
        var rows = Table(
            Header,
            Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", "25"),
            Row("3002", "Hose", "Skihose", "Killtec", "134", "30"),
            Row("3003", "Helm", "Helm", "Uvex", null, "40"));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        Assert.Empty(result.Errors);
        Assert.Equal(new[] { 3001, 3002, 3003 }, result.Lines.Select(line => line.Number).ToArray());
    }

    [Fact]
    public void Parse_ValidRow_MapsColumnsInFixedOrderWithFileRowNumber()
    {
        // Arrange
        var rows = Table(Header, Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", "25"));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        Assert.Equal(new ImportArticleLine(2, 3001, "Jacke", "Ski Jacke", "Icepeak", "128", 25), result.Lines[0]);
    }

    [Fact]
    public void Parse_OtherHeaderLabelsAndSeventhColumn_MapsFirstSixColumnsByOrder()
    {
        // Arrange
        var rows = Table(
            Row("Nummer", "Titel", "Typ", "Hersteller", "Ma\u00df", "VK", "min. Preis"),
            Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", "25", "20"));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        Assert.Equal(new ImportArticleLine(2, 3001, "Jacke", "Ski Jacke", "Icepeak", "128", 25), result.Lines.Single());
    }

    [Fact]
    public void Parse_RowsWithOnlyNumberOrNoContent_SkipsThemWithoutMessage()
    {
        // Arrange
        var rows = Table(
            Header,
            Valid("3001"),
            Row("3002", null, null, null, null, null),
            Row("3003"),
            Row(),
            Row(null, null, null, null, null, null),
            Valid("3004"));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        Assert.Empty(result.Errors);
        Assert.Equal(new[] { 3001, 3004 }, result.Lines.Select(line => line.Number).ToArray());
    }

    [Fact]
    public void Parse_RowWithoutName_ReportsFileRowAndMissingField()
    {
        // Arrange
        var rows = Table(
            Header,
            Valid("3001"),
            Valid("3002"),
            Row("3003", null, "Ski Jacke", "Icepeak", "128", "25"));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        var error = Assert.Single(result.Errors);
        Assert.Equal(4, error.RowNumber);
        Assert.Equal("3003", error.ArticleNumber);
        Assert.Contains("Bezeichnung", error.Reason);
    }

    [Fact]
    public void Parse_RowWithMissingFieldAmongValidRows_ReturnsOnlyValidRowsAsLines()
    {
        // Arrange
        var rows = Table(
            Header,
            Valid("3001"),
            Row("3002", null, "Ski Jacke", "Icepeak", "128", "25"));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        Assert.Equal(new[] { 3001 }, result.Lines.Select(line => line.Number).ToArray());
    }

    [Fact]
    public void Parse_NonIntegerArticleNumber_ReportsRowAndReason()
    {
        // Arrange
        var rows = Table(Header, Valid("3001"), Valid("A12"));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        var error = Assert.Single(result.Errors);
        Assert.Equal(3, error.RowNumber);
        Assert.Equal("Artikelnummer ist keine Ganzzahl", error.Reason);
    }

    [Theory]
    [InlineData("0")]
    [InlineData("-3")]
    public void Parse_ArticleNumberNotGreaterThanZero_ReportsRowAndReason(string number)
    {
        // Arrange
        var rows = Table(Header, Valid("3001"), Valid("3002"), Valid("3003"), Valid(number));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        var error = Assert.Single(result.Errors);
        Assert.Equal(5, error.RowNumber);
        Assert.Equal("Artikelnummer muss gr\u00f6\u00dfer als 0 sein", error.Reason);
    }

    [Fact]
    public void Parse_NumberRepeatedInFile_ReportsLaterRowAsDuplicate()
    {
        // Arrange
        var rows = new List<object?[]> { Header, Valid("3000"), Valid("3001") };
        for (var offset = 0; offset < 5; offset++)
        {
            rows.Add(Valid((3100 + offset).ToString(CultureInfo.InvariantCulture)));
        }

        rows.Add(Valid("3001"));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        var error = Assert.Single(result.Errors);
        Assert.Equal(9, error.RowNumber);
        Assert.Equal("Artikelnummer kommt in der Datei doppelt vor", error.Reason);
    }

    [Theory]
    [InlineData("199,95")]
    [InlineData("0")]
    [InlineData("-5")]
    public void Parse_PriceNotWholeNumberGreaterThanZero_ReportsRowAndReason(string price)
    {
        // Arrange
        var rows = Table(
            Header,
            Valid("3001"),
            Valid("3002"),
            Row("3003", "Jacke", "Ski Jacke", "Icepeak", "128", price));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        var error = Assert.Single(result.Errors);
        Assert.Equal(4, error.RowNumber);
        Assert.Equal("Preis muss eine Ganzzahl gr\u00f6\u00dfer als 0 sein", error.Reason);
    }

    [Theory]
    [InlineData("de-DE", "199,00")]
    [InlineData("en-US", "199.00")]
    public void Parse_PriceWithZeroDecimalsInBrowserLanguageFormat_AcceptsWholePrice(string locale, string price)
    {
        // Arrange
        var rows = Table(Header, Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", price));

        // Act
        var result = ArticleTableParser.Parse(rows, CultureInfo.GetCultureInfo(locale));

        // Assert
        Assert.Equal(199, result.Lines.Single().Price);
    }

    [Fact]
    public void Parse_NumericCellsFromWorkbook_AcceptsNumbersAsText()
    {
        // Arrange
        var rows = Table(Header, Row(3001.0, "Jacke", "Ski Jacke", "Icepeak", 128.0, 25.0));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        Assert.Equal(new ImportArticleLine(2, 3001, "Jacke", "Ski Jacke", "Icepeak", "128", 25), result.Lines.Single());
    }

    [Fact]
    public void Parse_ValuesWithSurroundingSpaces_TrimsValues()
    {
        // Arrange
        var rows = Table(Header, Row(" 3001 ", " Jacke ", " Ski Jacke", " Icepeak ", null, " 25 "));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        Assert.Equal(new ImportArticleLine(2, 3001, "Jacke", "Ski Jacke", "Icepeak", null, 25), result.Lines.Single());
    }

    [Fact]
    public void Parse_RowWithValidNumberButInvalidPrice_ListsNumberInNumberedRows()
    {
        // Arrange
        var rows = Table(Header, Row("3001", "Jacke", "Ski Jacke", "Icepeak", "128", "0"));

        // Act
        var result = ArticleTableParser.Parse(rows, German);

        // Assert
        Assert.Equal(new NumberedRow(2, 3001), result.NumberedRows.Single());
    }
}
