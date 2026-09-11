using BAR.Modules.Stammdaten.Contracts.MasterData;
using FluentValidation;

namespace BAR.Modules.Stammdaten.Application.MasterData.Brands.Update;

public sealed class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
