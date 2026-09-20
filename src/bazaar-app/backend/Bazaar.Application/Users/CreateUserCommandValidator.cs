using FluentValidation;

namespace Bazaar.Application.Users;

public sealed class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    public CreateUserCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.InitialPassword)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Passwort muss mindestens 8 Zeichen lang sein");
    }
}
