using FluentValidation;

namespace Bazaar.Application.Articles;

public sealed class UpdateArticleCommandValidator : AbstractValidator<UpdateArticleCommand>
{
    public UpdateArticleCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty();
        RuleFor(x => x.Number).GreaterThan(0).WithMessage("Artikelnummer muss eine ganze Zahl ab 1 sein.");
        RuleFor(x => x.Brand).NotEmpty();
        RuleFor(x => x.Category).NotEmpty();
        RuleFor(x => x.Price).GreaterThan(0);
    }
}
