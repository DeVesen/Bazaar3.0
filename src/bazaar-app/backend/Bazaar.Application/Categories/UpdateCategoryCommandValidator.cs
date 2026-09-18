using FluentValidation;

namespace Bazaar.Application.Categories;

public sealed class UpdateCategoryCommandValidator : AbstractValidator<UpdateCategoryCommand>
{
    public UpdateCategoryCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
    }
}
