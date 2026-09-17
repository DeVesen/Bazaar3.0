using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Domain.Articles;
using BAR.Modules.Registration.Domain.NumberBlocks;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ArticleImportValidatorTests
{
    private static readonly DateTime Now = new(2026, 9, 17, 10, 0, 0, DateTimeKind.Utc);
    private static readonly NumberBlock Block = NumberBlock.Assign("s1", 101, 5, Now);

    private static ImportRawRow Row(int line, string number, string name = "", string category = "", string brand = "", string size = "", string price = "") =>
        new(line, number, name, category, brand, size, price);

    [Fact]
    public void Validate_NumberNotAnInteger_ReturnsInvalidNumberError()
    {
        var (actions, errors) = ArticleImportValidator.Validate([Row(2, "abc")], [Block], []);

        Assert.Empty(actions);
        Assert.Equal("import.invalid_number", errors.Single().ErrorCode);
    }

    [Fact]
    public void Validate_NumberOutsideOwnBlocks_ReturnsNotInOwnRangeError()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "999", "A", "B", "C", price: "1,00")], [Block], []);

        Assert.Empty(actions);
        Assert.Equal("import.number_not_in_own_range", errors.Single().ErrorCode);
    }

    [Fact]
    public void Validate_DuplicateNumberInFile_ReturnsDuplicateErrorForSecondOccurrence()
    {
        var rows = new[] { Row(2, "101", "A", "B", "C", price: "1,00"), Row(3, "101", "A", "B", "C", price: "1,00") };

        var (actions, errors) = ArticleImportValidator.Validate(rows, [Block], []);

        Assert.Equal("import.duplicate_number", errors.Single().ErrorCode);
        Assert.Equal(3, errors.Single().Row);
    }

    [Fact]
    public void Validate_FreeNumberEmptyRow_ReturnsNoOpAction()
    {
        var (actions, errors) = ArticleImportValidator.Validate([Row(2, "101")], [Block], []);

        Assert.Empty(errors);
        Assert.Equal(ImportActionKind.NoOp, actions.Single().Kind);
    }

    [Fact]
    public void Validate_FreeNumberFilledRow_ReturnsCreateAction()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", "Jacke", "Jacken", "Nike", "M", "12,50")], [Block], []);

        Assert.Empty(errors);
        var action = actions.Single();
        Assert.Equal(ImportActionKind.Create, action.Kind);
        Assert.Equal(101, action.Number);
        Assert.Equal("Jacke", action.Name);
        Assert.Equal(12.50m, action.Price);
    }

    [Fact]
    public void Validate_OccupiedNumberFilledRow_ReturnsUpdateAction()
    {
        var existing = Article.Create("s1", 101, "Alt", "B", "C", 1m, null, null, null, Now);

        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", "Neu", "B2", "C2", price: "2,00")], [Block], [existing]);

        Assert.Empty(errors);
        Assert.Equal(ImportActionKind.Update, actions.Single().Kind);
    }

    [Fact]
    public void Validate_OccupiedNumberEmptyRow_ReturnsDeleteAction()
    {
        var existing = Article.Create("s1", 101, "Alt", "B", "C", 1m, null, null, null, Now);

        var (actions, errors) = ArticleImportValidator.Validate([Row(2, "101")], [Block], [existing]);

        Assert.Empty(errors);
        Assert.Equal(ImportActionKind.Delete, actions.Single().Kind);
    }

    [Fact]
    public void Validate_MissingRequiredField_ReturnsMissingFieldError()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", name: "Jacke", price: "1,00")], [Block], []);

        Assert.Equal("import.missing_field", errors.Single().ErrorCode);
    }

    [Fact]
    public void Validate_InvalidPrice_ReturnsInvalidPriceError()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", "Jacke", "Jacken", "Nike", price: "kostenlos")], [Block], []);

        Assert.Equal("import.invalid_price", errors.Single().ErrorCode);
    }

    [Fact]
    public void Validate_ZeroPrice_ReturnsInvalidPriceError()
    {
        var (actions, errors) = ArticleImportValidator.Validate(
            [Row(2, "101", "Jacke", "Jacken", "Nike", price: "0,00")], [Block], []);

        Assert.Equal("import.invalid_price", errors.Single().ErrorCode);
    }
}
