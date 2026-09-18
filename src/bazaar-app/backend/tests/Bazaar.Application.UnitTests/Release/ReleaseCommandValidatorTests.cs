using Bazaar.Application.Release;

namespace Bazaar.Application.UnitTests.Release;

public class ReleaseCommandValidatorTests
{
    private readonly ReleaseCommandValidator _sut = new();

    private static ReleaseCommand ValidCommand() => new()
    {
        SellerId = "SELLER001",
        FeeAmount = 5.00m,
        ArticleIds = ["ARTICLE001"],
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
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(ReleaseCommand.SellerId));
    }

    [Fact]
    public void Validate_EmptyArticleIdsList_HasValidationError()
    {
        var command = ValidCommand();
        command.ArticleIds = [];

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(ReleaseCommand.ArticleIds));
    }
}
