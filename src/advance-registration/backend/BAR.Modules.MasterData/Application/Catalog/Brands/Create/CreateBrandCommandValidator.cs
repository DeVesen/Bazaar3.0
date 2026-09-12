using BAR.Modules.MasterData.Contracts.MasterData;
using FluentValidation;

namespace BAR.Modules.MasterData.Application.Catalog.Brands.Create;

public sealed class CreateBrandCommandValidator : AbstractValidator<CreateBrandCommand>
{
    public CreateBrandCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
