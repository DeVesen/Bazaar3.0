using Bazaar.Application.Sellers;

namespace Bazaar.Application.UnitTests.Sellers;

public class UpdateSellerCommandValidatorTests
{
    private readonly UpdateSellerCommandValidator _sut = new();

    private static UpdateSellerCommand ValidCommand() => new()
    {
        Id = "SELLER001",
        FirstName = "Anna",
        LastName = "Meier",
        Email = "anna@example.org",
        SellerTypeId = "SELLERTYPE001",
        SalesCommission = 10m,
        FeePerItem = 0.5m,
        CallerIsAdmin = false
    };

    [Fact]
    public void Validate_AllRequiredFieldsSet_IsValid()
    {
        var result = _sut.Validate(ValidCommand());

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_EmptyFirstName_HasValidationError()
    {
        var command = ValidCommand();
        command.FirstName = "";

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerCommand.FirstName));
    }

    [Fact]
    public void Validate_EmptyLastName_HasValidationError()
    {
        var command = ValidCommand();
        command.LastName = "";

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerCommand.LastName));
    }

    [Fact]
    public void Validate_EmptyEmail_HasValidationError()
    {
        var command = ValidCommand();
        command.Email = "";

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerCommand.Email));
    }

    [Fact]
    public void Validate_EmptySellerTypeId_HasValidationError()
    {
        var command = ValidCommand();
        command.SellerTypeId = "";

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerCommand.SellerTypeId));
    }
}
