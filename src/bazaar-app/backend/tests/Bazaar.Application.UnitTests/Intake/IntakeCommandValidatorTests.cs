using Bazaar.Application.Intake;

namespace Bazaar.Application.UnitTests.Intake;

public class IntakeCommandValidatorTests
{
    private readonly IntakeCommandValidator _sut = new();

    private static IntakeArticleLine ValidLine(int number = 1043) => new()
    {
        Number = number,
        Name = "Winterjacke",
        Brand = "Nike",
        Category = "Jacken",
        Price = 12.00m,
    };

    private static IntakeCommand ValidCommand() => new()
    {
        SellerId = "SELLER001",
        FeeAmount = 6.00m,
        Articles = [ValidLine()],
    };

    [Fact]
    public void Validate_ValidCommand_IsValid()
    {
        var result = _sut.Validate(ValidCommand());

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_EmptySellerId_HasValidationError()
    {
        var command = ValidCommand();
        command.SellerId = "";

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(IntakeCommand.SellerId));
    }

    [Fact]
    public void Validate_EmptyArticlesList_HasValidationError()
    {
        var command = ValidCommand();
        command.Articles = [];

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(IntakeCommand.Articles));
    }

    [Fact]
    public void Validate_ArticleWithNumberZero_HasValidationError()
    {
        var command = ValidCommand();
        command.Articles = [ValidLine(number: 0)];

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.EndsWith(nameof(IntakeArticleLine.Number)));
    }

    [Fact]
    public void Validate_ArticleWithEmptyName_HasValidationError()
    {
        var command = ValidCommand();
        var line = ValidLine();
        line.Name = "";
        command.Articles = [line];

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.EndsWith(nameof(IntakeArticleLine.Name)));
    }

    [Fact]
    public void Validate_ArticleWithEmptyBrand_HasValidationError()
    {
        var command = ValidCommand();
        var line = ValidLine();
        line.Brand = "";
        command.Articles = [line];

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.EndsWith(nameof(IntakeArticleLine.Brand)));
    }

    [Fact]
    public void Validate_ArticleWithEmptyCategory_HasValidationError()
    {
        var command = ValidCommand();
        var line = ValidLine();
        line.Category = "";
        command.Articles = [line];

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.EndsWith(nameof(IntakeArticleLine.Category)));
    }

    [Fact]
    public void Validate_ArticleWithZeroPrice_HasValidationError()
    {
        var command = ValidCommand();
        var line = ValidLine();
        line.Price = 0m;
        command.Articles = [line];

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName.EndsWith(nameof(IntakeArticleLine.Price)));
    }

    [Fact]
    public void DeleteArticleNumber_ZeroOrNegative_IsInvalid()
    {
        var command = ValidCommand();
        command.Articles[0].DeleteArticleNumber = 0;

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
    }

    [Fact]
    public void DeleteArticleNumber_Null_IsValid()
    {
        var command = ValidCommand();
        command.Articles[0].DeleteArticleNumber = null;

        var result = _sut.Validate(command);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void DeleteArticleNumber_Positive_IsValid()
    {
        var command = ValidCommand();
        command.Articles[0].DeleteArticleNumber = 1;

        var result = _sut.Validate(command);

        Assert.True(result.IsValid);
    }
}
