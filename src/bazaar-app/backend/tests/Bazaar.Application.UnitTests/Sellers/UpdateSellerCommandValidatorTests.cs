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
        City = "Karlsruhe",
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

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    public void Validate_MissingEmail_IsValid(string? email)
    {
        var command = ValidCommand();
        command.Email = email;

        var result = _sut.Validate(command);

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_EmptyCity_HasValidationError()
    {
        var command = ValidCommand();
        command.City = "";

        var result = _sut.Validate(command);

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(UpdateSellerCommand.City));
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
