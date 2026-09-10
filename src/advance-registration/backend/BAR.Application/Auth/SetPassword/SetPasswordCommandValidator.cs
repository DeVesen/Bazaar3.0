using FluentValidation;

namespace BAR.Application.Auth.SetPassword;

public sealed class SetPasswordCommandValidator : AbstractValidator<SetPasswordCommand>
{
    public SetPasswordCommandValidator()
    {
        RuleFor(c => c.InviteToken).NotEmpty();
        // Passwortstaerke "mind. Mittel" (Epic_Login Abschnitt 6): >=8 Zeichen
        // und mindestens 2 der 4 Zeichentypen Gross/Klein/Zahl/Sonderzeichen.
        // Manuell synchron zu RegisterCommandValidator - je ein Aufrufer heute,
        // eine gemeinsame Extraktion waere spekulativ.
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
