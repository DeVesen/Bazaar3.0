using BAR.Modules.Registration.Contracts.Articles;
using FluentValidation;

namespace BAR.Modules.Registration.Application.Articles.Create;

public sealed class CreateArticleCommandValidator : AbstractValidator<CreateArticleCommand>
{
    public CreateArticleCommandValidator()
    {
        RuleFor(c => c.Name).NotEmpty();
        RuleFor(c => c.Brand).NotEmpty();
        RuleFor(c => c.Category).NotEmpty();
        RuleFor(c => c.Price).GreaterThan(0).WithMessage("Preis muss größer als 0 sein");
    }
}
