using FluentValidation;

namespace Bazaar.Application.Settlement;

public sealed class SettleSellerCommandValidator : AbstractValidator<SettleSellerCommand>
{
    public SettleSellerCommandValidator()
    {
        RuleFor(x => x.SellerId).NotEmpty();
    }
}
