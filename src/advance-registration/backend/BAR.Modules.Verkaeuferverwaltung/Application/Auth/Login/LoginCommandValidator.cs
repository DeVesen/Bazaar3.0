using BAR.Modules.Verkaeuferverwaltung.Contracts.Auth;
using FluentValidation;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Auth.Login;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(c => c.Email).NotEmpty().EmailAddress();
        RuleFor(c => c.Password).NotEmpty();
    }
}
