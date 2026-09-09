using FluentValidation;

namespace BAR.Application.MasterData.Brands.Update;

public sealed class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
