using BAR.Modules.Registration.Application.Articles.ImportExport;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ArticleCsvWriterTests
{
    [Fact]
    public void Write_HeaderRow_MatchesExactGermanColumns()
    {
        var csv = ArticleCsvWriter.Write([]);

        Assert.StartsWith("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n", csv);
    }

    [Fact]
    public void Write_FullyFilledRow_UsesCommaAsDecimalSeparator()
    {
        var csv = ArticleCsvWriter.Write([new ArticleExportRow(101, "Jacke", "Jacken", "Nike", "M", 12.5m)]);

        Assert.Contains("101;Jacke;Jacken;Nike;M;12,50\r\n", csv);
    }

    [Fact]
    public void Write_EmptyRow_OnlyNumberFilledRestBlank()
    {
        var csv = ArticleCsvWriter.Write([new ArticleExportRow(102, null, null, null, null, null)]);

        Assert.Contains("102;;;;;\r\n", csv);
    }
}
