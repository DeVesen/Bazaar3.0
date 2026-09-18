using FluentValidation;

namespace Bazaar.Application.Brands;

public sealed class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}
