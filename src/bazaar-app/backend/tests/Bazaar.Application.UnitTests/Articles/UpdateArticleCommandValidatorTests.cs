using Bazaar.Application.Articles;

namespace Bazaar.Application.UnitTests.Articles;

public class UpdateArticleCommandValidatorTests
{
    private const string NumberErrorMessage = "Artikelnummer muss eine ganze Zahl ab 1 sein.";

    private static UpdateArticleCommand CreateCommand(int number) => new()
    {
        Id = "ARTICLE001",
        Number = number,
        Name = "T-Shirt",
        Brand = "Puma",
        Category = "Kleidung",
        Price = 10m
    };

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    public void Validate_ZeroOrNegativeNumber_ReturnsNumberError(int invalidNumber)
    {
        // Arrange
        var sut = new UpdateArticleCommandValidator();

        // Act
        var result = sut.Validate(CreateCommand(invalidNumber));

        // Assert
        Assert.Contains(result.Errors, e => e.PropertyName == "Number" && e.ErrorMessage == NumberErrorMessage);
    }

    [Fact]
    public void Validate_PositiveNumber_HasNoNumberError()
    {
        // Arrange
        var sut = new UpdateArticleCommandValidator();

        // Act
        var result = sut.Validate(CreateCommand(1043));

        // Assert
        Assert.DoesNotContain(result.Errors, e => e.PropertyName == "Number");
    }
}
