using FluentValidation;

namespace BAR.Application.Profile.ChangePassword;

public sealed class ChangePasswordCommandValidator : AbstractValidator<ChangePasswordCommand>
{
    public ChangePasswordCommandValidator()
    {
        RuleFor(c => c.CurrentPassword).NotEmpty();

        // Passwortstaerke "mind. Mittel" - dupliziert aus RegisterCommandValidator/
        // SetPasswordCommandValidator (Projektkonvention: je ein Aufrufer, keine
        // spekulative Extraktion).
        RuleFor(c => c.NewPassword)
            .NotEmpty()
            .MinimumLength(8)
            .Must(HasAtLeastTwoCharacterTypes)
            .WithMessage("Passwort muss mindestens 'Mittel' stark sein.");

        RuleFor(c => c.NewPasswordConfirmation)
            .Equal(c => c.NewPassword)
            .WithMessage("Passwörter stimmen nicht überein.");
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
