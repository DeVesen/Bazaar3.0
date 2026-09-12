using BAR.Modules.MasterData.Contracts.MasterData;
using FluentValidation;

namespace BAR.Modules.MasterData.Application.Catalog.Categories.Update;

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
