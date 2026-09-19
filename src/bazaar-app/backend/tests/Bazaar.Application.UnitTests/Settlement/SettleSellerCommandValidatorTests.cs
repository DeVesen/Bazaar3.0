using Bazaar.Application.Settlement;

namespace Bazaar.Application.UnitTests.Settlement;

public class SettleSellerCommandValidatorTests
{
    private readonly SettleSellerCommandValidator _sut = new();

    private static SettleSellerCommand ValidCommand() => new()
    {
        SellerId = "SELLER001",
        PayoutAmount = 74.37m,
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
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(SettleSellerCommand.SellerId));
    }
}
