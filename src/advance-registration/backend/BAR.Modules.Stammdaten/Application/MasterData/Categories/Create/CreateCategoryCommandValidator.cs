using BAR.Modules.Stammdaten.Contracts.MasterData;
using FluentValidation;

namespace BAR.Modules.Stammdaten.Application.MasterData.Categories.Create;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
