using FluentValidation;

namespace BAR.Application.SellerTypes.Update;

public sealed class UpdateSellerTypeCommandValidator : AbstractValidator<UpdateSellerTypeCommand>
{
    public UpdateSellerTypeCommandValidator()
    {
        RuleFor(c => c.Name).NotEmpty();
        RuleFor(c => c.CommissionRate).InclusiveBetween(0, 100);
        RuleFor(c => c.ItemFee).GreaterThanOrEqualTo(0);
    }
}
