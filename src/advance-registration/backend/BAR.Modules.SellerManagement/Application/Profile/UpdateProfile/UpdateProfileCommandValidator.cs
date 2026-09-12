using BAR.Modules.SellerManagement.Contracts.Profile;
using FluentValidation;

namespace BAR.Modules.SellerManagement.Application.Profile.UpdateProfile;

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(c => c.FirstName).NotEmpty();
        RuleFor(c => c.LastName).NotEmpty();
        RuleFor(c => c.PostalCode).NotEmpty();
        RuleFor(c => c.City).NotEmpty();
        RuleFor(c => c.Phone).NotEmpty();
    }
}
