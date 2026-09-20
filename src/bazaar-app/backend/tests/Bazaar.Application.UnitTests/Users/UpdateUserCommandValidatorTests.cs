using Bazaar.Application.Users;
using Bazaar.Domain.Users;

namespace Bazaar.Application.UnitTests.Users;

public class UpdateUserCommandValidatorTests
{
    private readonly UpdateUserCommandValidator _sut = new();

    [Fact]
    public void Validate_NeitherFieldSet_HasValidationError()
    {
        var result = _sut.Validate(new UpdateUserCommand { Id = "USER001" });

        Assert.False(result.IsValid);
    }

    [Fact]
    public void Validate_OnlyRoleSet_IsValid()
    {
        var result = _sut.Validate(new UpdateUserCommand { Id = "USER001", NewRole = Role.Admin });

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_OnlyPasswordSetAtLeast8Chars_IsValid()
    {
        var result = _sut.Validate(new UpdateUserCommand { Id = "USER001", NewPassword = "password1" });

        Assert.True(result.IsValid);
    }

    [Fact]
    public void Validate_PasswordSetButShorterThan8Chars_HasValidationError()
    {
        var result = _sut.Validate(new UpdateUserCommand { Id = "USER001", NewPassword = "short" });

        Assert.False(result.IsValid);
        Assert.Contains(result.Errors, e =>
            e.PropertyName == nameof(UpdateUserCommand.NewPassword) &&
            e.ErrorMessage == "Passwort muss mindestens 8 Zeichen lang sein");
    }
}
