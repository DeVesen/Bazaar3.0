using FluentValidation;

namespace Bazaar.Application.Users;

public sealed class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    public UpdateUserCommandValidator()
    {
        RuleFor(x => x)
            .Must(x => x.Role is not null || !string.IsNullOrEmpty(x.NewPassword))
            .WithMessage("Entweder Rolle oder neues Passwort muss angegeben werden")
            .WithName("role");

        RuleFor(x => x.NewPassword)
            .MinimumLength(8).WithMessage("Passwort muss mindestens 8 Zeichen lang sein")
            .When(x => !string.IsNullOrEmpty(x.NewPassword));
    }
}
