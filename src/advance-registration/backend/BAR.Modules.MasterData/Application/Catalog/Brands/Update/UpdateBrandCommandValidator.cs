using BAR.Modules.MasterData.Contracts.MasterData;
using FluentValidation;

namespace BAR.Modules.MasterData.Application.Catalog.Brands.Update;

public sealed class UpdateBrandCommandValidator : AbstractValidator<UpdateBrandCommand>
{
    public UpdateBrandCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
