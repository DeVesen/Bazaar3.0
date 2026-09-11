using BAR.Modules.Stammdaten.Contracts.MasterData;
using FluentValidation;

namespace BAR.Modules.Stammdaten.Application.MasterData.Brands.Create;

public sealed class CreateBrandCommandValidator : AbstractValidator<CreateBrandCommand>
{
    public CreateBrandCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
