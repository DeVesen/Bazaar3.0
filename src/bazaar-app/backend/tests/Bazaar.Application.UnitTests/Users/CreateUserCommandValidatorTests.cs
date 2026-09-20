using Bazaar.Application.Users;
using Bazaar.Domain.Users;

namespace Bazaar.Application.UnitTests.Users;

public class CreateUserCommandValidatorTests
{
    private readonly CreateUserCommandValidator _sut = new();

    [Fact]
    public void Validate_EmptyUsername_HasValidationError()
    {
        var result = _sut.Validate(new CreateUserCommand { Username = "", Role = Role.Cashier, InitialPassword = "password1" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e => e.PropertyName == nameof(CreateUserCommand.Username));
    }

    [Fact]
    public void Validate_PasswordShorterThan8Chars_HasValidationErrorWithExactMessage()
    {
        var result = _sut.Validate(new CreateUserCommand { Username = "kasse2", Role = Role.Cashier, InitialPassword = "short" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e =>
            e.PropertyName == nameof(CreateUserCommand.InitialPassword) &&
            e.ErrorMessage == "Passwort muss mindestens 8 Zeichen lang sein");
    }

    [Fact]
    public void Validate_PasswordAtLeast8Chars_IsValid()
    {
        var result = _sut.Validate(new CreateUserCommand { Username = "kasse2", Role = Role.Cashier, InitialPassword = "password1" });

        Assert.True(result.IsValid);
    }
}
