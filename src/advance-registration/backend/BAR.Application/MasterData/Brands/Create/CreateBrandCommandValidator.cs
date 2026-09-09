using FluentValidation;

namespace BAR.Application.MasterData.Brands.Create;

public sealed class CreateBrandCommandValidator : AbstractValidator<CreateBrandCommand>
{
    public CreateBrandCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
