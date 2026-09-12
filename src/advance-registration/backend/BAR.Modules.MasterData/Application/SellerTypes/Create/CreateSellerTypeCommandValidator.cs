using BAR.Modules.MasterData.Contracts.SellerTypes;
using FluentValidation;

namespace BAR.Modules.MasterData.Application.SellerTypes.Create;

public sealed class CreateSellerTypeCommandValidator : AbstractValidator<CreateSellerTypeCommand>
{
    public CreateSellerTypeCommandValidator()
    {
        RuleFor(c => c.Name).NotEmpty();
        RuleFor(c => c.CommissionRate).InclusiveBetween(0, 100);
        RuleFor(c => c.ItemFee).GreaterThanOrEqualTo(0);
    }
}
