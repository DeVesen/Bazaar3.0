using BAR.Modules.SellerManagement.Contracts.Auth;
using FluentValidation;

namespace BAR.Modules.SellerManagement.Application.Auth.SetPassword;

public sealed class SetPasswordCommandValidator : AbstractValidator<SetPasswordCommand>
{
    public SetPasswordCommandValidator()
    {
        RuleFor(c => c.InviteToken).NotEmpty();
        RuleFor(c => c.Password)
            .NotEmpty()
            .MinimumLength(8)
            .Must(HasAtLeastTwoCharacterTypes)
            .WithMessage("Passwort muss mindestens 'Mittel' stark sein.");
    }

    private static bool HasAtLeastTwoCharacterTypes(string password)
    {
        var typeCount = new[]
        {
            password.Any(char.IsUpper),
            password.Any(char.IsLower),
            password.Any(char.IsDigit),
            password.Any(c => !char.IsLetterOrDigit(c))
        }.Count(x => x);

        return typeCount >= 2;
    }
}
