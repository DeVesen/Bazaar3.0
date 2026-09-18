using FluentValidation;

namespace Bazaar.Application.SellerTypes;

public sealed class UpdateSellerTypeCommandValidator : AbstractValidator<UpdateSellerTypeCommand>
{
    public UpdateSellerTypeCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.CommissionRate).InclusiveBetween(0, 100);
        RuleFor(x => x.ItemFee).GreaterThanOrEqualTo(0);
    }
}
