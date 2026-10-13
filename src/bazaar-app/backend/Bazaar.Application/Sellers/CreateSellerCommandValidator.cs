using FluentValidation;

namespace Bazaar.Application.Sellers;

public sealed class CreateSellerCommandValidator : AbstractValidator<CreateSellerCommand>
{
    public CreateSellerCommandValidator()
    {
        RuleFor(x => x.FirstName).NotEmpty();
        RuleFor(x => x.LastName).NotEmpty();
        RuleFor(x => x.City).NotEmpty();
        RuleFor(x => x.SellerTypeId).NotEmpty();
    }
}
