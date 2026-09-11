using BAR.Modules.Verkaeuferverwaltung.Contracts.Profile;
using FluentValidation;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Profile.ChangeEmail;

public sealed class ChangeEmailCommandValidator : AbstractValidator<ChangeEmailCommand>
{
    public ChangeEmailCommandValidator()
    {
        RuleFor(c => c.NewEmail).NotEmpty().EmailAddress();
        RuleFor(c => c.CurrentPassword).NotEmpty();
    }
}
