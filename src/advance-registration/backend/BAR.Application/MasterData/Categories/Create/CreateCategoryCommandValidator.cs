using FluentValidation;

namespace BAR.Application.MasterData.Categories.Create;

public sealed class CreateCategoryCommandValidator : AbstractValidator<CreateCategoryCommand>
{
    public CreateCategoryCommandValidator() => RuleFor(c => c.Name).NotEmpty();
}
