using FluentValidation;

namespace Bazaar.Application.Sellers;

public sealed class UpdateSellerCommandValidator : AbstractValidator<UpdateSellerCommand>
{
    public UpdateSellerCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.SellerTypeId).NotEmpty();
    }
}
