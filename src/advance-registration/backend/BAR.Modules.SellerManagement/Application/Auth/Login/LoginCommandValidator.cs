using BAR.Modules.SellerManagement.Contracts.Auth;
using FluentValidation;

namespace BAR.Modules.SellerManagement.Application.Auth.Login;

public sealed class LoginCommandValidator : AbstractValidator<LoginCommand>
{
    public LoginCommandValidator()
    {
        RuleFor(c => c.Email).NotEmpty().EmailAddress();
        RuleFor(c => c.Password).NotEmpty();
    }
}
