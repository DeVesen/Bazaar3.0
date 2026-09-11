using BAR.Modules.Anmeldung.Contracts.Articles;
using FluentValidation;

namespace BAR.Modules.Anmeldung.Application.Articles.Update;

public sealed class UpdateArticleCommandValidator : AbstractValidator<UpdateArticleCommand>
{
    public UpdateArticleCommandValidator()
    {
        RuleFor(c => c.Name).NotEmpty();
        RuleFor(c => c.Brand).NotEmpty();
        RuleFor(c => c.Category).NotEmpty();
        RuleFor(c => c.Price).GreaterThan(0).WithMessage("Preis muss größer als 0 sein");
    }
}
