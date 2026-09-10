using FluentValidation;

namespace BAR.Application.Sellers.Create;

public sealed class CreateSellerCommandValidator : AbstractValidator<CreateSellerCommand>
{
    public CreateSellerCommandValidator()
    {
        RuleFor(c => c.FirstName).NotEmpty();
        RuleFor(c => c.LastName).NotEmpty();
        RuleFor(c => c.PostalCode).NotEmpty();
        RuleFor(c => c.City).NotEmpty();
        RuleFor(c => c.Phone).NotEmpty();
        RuleFor(c => c.Email).NotEmpty().EmailAddress();
        RuleFor(c => c.SellerTypeId).NotEmpty();
    }
}
