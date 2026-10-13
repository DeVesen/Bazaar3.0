using Bazaar.Application.ArticleImport;

namespace Bazaar.Application.UnitTests.ArticleImport;

public class ArticleImportErrorMessageTests
{
    private static List<ImportRowError> Errors(int count) =>
        Enumerable.Range(0, count)
            .Select(index => new ImportRowError(index + 2, (3000 + index).ToString(), "Preis muss eine Ganzzahl größer als 0 sein"))
            .ToList();

    [Fact]
    public void Format_TwelveErrors_ListsTenAndRemainder()
    {
        // Arrange
        var errors = Errors(12);

        // Act
        var lines = ArticleImportErrorMessage.Format(errors).Split('\n');

        // Assert
        Assert.Equal(11, lines.Length);
        Assert.Equal("und 2 weitere", lines[^1]);
    }

    [Fact]
    public void Format_ErrorWithArticleNumber_ContainsRowNumberArticleNumberAndReason()
    {
        // Arrange
        var errors = Errors(1);

        // Act
        var message = ArticleImportErrorMessage.Format(errors);

        // Assert
        Assert.Equal("Zeile 2, Artikelnummer 3000: Preis muss eine Ganzzahl größer als 0 sein", message);
    }

    [Fact]
    public void Format_ErrorWithoutArticleNumber_OmitsArticleNumber()
    {
        // Arrange
        var errors = new List<ImportRowError> { new(4, null, "Pflichtfeld „Artikelnummer“ fehlt") };

        // Act
        var message = ArticleImportErrorMessage.Format(errors);

        // Assert
        Assert.Equal("Zeile 4: Pflichtfeld „Artikelnummer“ fehlt", message);
    }

    [Fact]
    public void Format_TenErrors_HasNoRemainderLine()
    {
        // Arrange
        var errors = Errors(10);

        // Act
        var lines = ArticleImportErrorMessage.Format(errors).Split('\n');

        // Assert
        Assert.Equal(10, lines.Length);
    }
}
