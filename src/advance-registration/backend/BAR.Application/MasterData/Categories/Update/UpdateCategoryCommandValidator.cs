using FluentValidation;

namespace BAR.Application.MasterData.Categories.Update;

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
