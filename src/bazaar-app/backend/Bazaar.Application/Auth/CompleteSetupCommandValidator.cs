using FluentValidation;

namespace Bazaar.Application.Auth;

public sealed class CompleteSetupCommandValidator : AbstractValidator<CompleteSetupCommand>
{
    public CompleteSetupCommandValidator()
    {
        RuleFor(x => x.Username).NotEmpty();
        RuleFor(x => x.Password)
            .NotEmpty()
            .MinimumLength(8).WithMessage("Passwort muss mindestens 8 Zeichen lang sein");

        RuleFor(x => x.SellerTypes).NotEmpty().WithMessage("Mindestens ein Händlertyp ist erforderlich");
        RuleForEach(x => x.SellerTypes).ChildRules(sellerType =>
        {
            sellerType.RuleFor(x => x.Name).NotEmpty();
            sellerType.RuleFor(x => x.CommissionRate).InclusiveBetween(0, 100);
            sellerType.RuleFor(x => x.ItemFee).GreaterThanOrEqualTo(0);
        });

        RuleForEach(x => x.BrandNames).NotEmpty();
        RuleForEach(x => x.CategoryNames).NotEmpty();
    }
}
