using System.Text;
using BAR.Modules.Registration.Application.Articles.ImportExport;
using ClosedXML.Excel;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ArticleImportFileParserTests
{
    [Fact]
    public void Parse_Csv_OneDataRow_MapsAllSixColumns()
    {
        var csv = "Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n101;Jacke;Jacken;Nike;M;12,50\r\n";
        var bytes = new UTF8Encoding(true).GetBytes(csv);

        var rows = ArticleImportFileParser.Parse(bytes, "import.csv");

        var row = rows.Single();
        Assert.Equal(2, row.LineNumber);
        Assert.Equal("101", row.NumberRaw);
        Assert.Equal("Jacke", row.Name);
        Assert.Equal("Jacken", row.Category);
        Assert.Equal("Nike", row.Brand);
        Assert.Equal("M", row.Size);
        Assert.Equal("12,50", row.PriceRaw);
    }

    [Fact]
    public void Parse_Csv_EmptyDataRow_KeepsBlankCellsAsEmptyStrings()
    {
        var csv = "Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n102;;;;;\r\n";
        var bytes = Encoding.UTF8.GetBytes(csv);

        var row = ArticleImportFileParser.Parse(bytes, "import.csv").Single();

        Assert.Equal("102", row.NumberRaw);
        Assert.Equal("", row.Name);
    }

    [Fact]
    public void Parse_Csv_TooFewColumns_ThrowsFormatException()
    {
        var bytes = Encoding.UTF8.GetBytes("Nummer;Bezeichnung\r\n101;Jacke\r\n");

        Assert.Throws<FormatException>(() => ArticleImportFileParser.Parse(bytes, "import.csv"));
    }

    [Fact]
    public void Parse_Xlsx_OneDataRow_MapsAllSixColumns()
    {
        using var stream = new MemoryStream();
        using (var workbook = new XLWorkbook())
        {
            var ws = workbook.Worksheets.Add("Sheet1");
            ws.Cell(1, 1).Value = "Nummer"; ws.Cell(1, 2).Value = "Bezeichnung"; ws.Cell(1, 3).Value = "Kategorie";
            ws.Cell(1, 4).Value = "Marke"; ws.Cell(1, 5).Value = "Größe"; ws.Cell(1, 6).Value = "Preis";
            ws.Cell(2, 1).Value = 101; ws.Cell(2, 2).Value = "Jacke"; ws.Cell(2, 3).Value = "Jacken";
            ws.Cell(2, 4).Value = "Nike"; ws.Cell(2, 5).Value = "M"; ws.Cell(2, 6).Value = "12,50";
            workbook.SaveAs(stream);
        }

        var rows = ArticleImportFileParser.Parse(stream.ToArray(), "import.xlsx");

        var row = rows.Single();
        Assert.Equal("101", row.NumberRaw);
        Assert.Equal("Jacke", row.Name);
    }

    [Fact]
    public void Parse_UnknownExtension_ThrowsFormatException()
    {
        Assert.Throws<FormatException>(() => ArticleImportFileParser.Parse([1, 2, 3], "import.txt"));
    }

    [Fact]
    public void Parse_GarbageBytesAsXlsx_ThrowsFormatException()
    {
        Assert.Throws<FormatException>(() => ArticleImportFileParser.Parse([1, 2, 3], "import.xlsx"));
    }
}
