using BAR.Modules.Stammdaten.Contracts.MasterData;
using FluentValidation;

namespace BAR.Modules.Stammdaten.Application.MasterData.Categories.Update;

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
