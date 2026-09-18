using FluentValidation;

namespace Bazaar.Application.Intake;

public sealed class IntakeCommandValidator : AbstractValidator<IntakeCommand>
{
    public IntakeCommandValidator()
    {
        RuleFor(x => x.SellerId).NotEmpty();
        RuleFor(x => x.Articles).NotEmpty();
        RuleForEach(x => x.Articles).ChildRules(article =>
        {
            article.RuleFor(x => x.Number).GreaterThan(0);
            article.RuleFor(x => x.Name).NotEmpty();
            article.RuleFor(x => x.Brand).NotEmpty();
            article.RuleFor(x => x.Category).NotEmpty();
            article.RuleFor(x => x.Price).GreaterThan(0);
        });
    }
}
