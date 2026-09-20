using FluentValidation;

namespace Bazaar.Application.Auth;

public sealed class BootstrapAdminCommandValidator : AbstractValidator<BootstrapAdminCommand>
{
    public BootstrapAdminCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Passwort muss mindestens 8 Zeichen lang sein");
    }
}
