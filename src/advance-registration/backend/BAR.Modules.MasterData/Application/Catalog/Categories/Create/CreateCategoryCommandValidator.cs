using BAR.Modules.MasterData.Contracts.MasterData;
using FluentValidation;

namespace BAR.Modules.MasterData.Application.Catalog.Categories.Create;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
