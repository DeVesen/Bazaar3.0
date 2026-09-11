using BAR.Modules.Verkaeuferverwaltung.Contracts.Sellers;
using FluentValidation;

namespace BAR.Modules.Verkaeuferverwaltung.Application.Sellers.Update;

public sealed class UpdateSellerCommandValidator : AbstractValidator<UpdateSellerCommand>
{
    public UpdateSellerCommandValidator()
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
