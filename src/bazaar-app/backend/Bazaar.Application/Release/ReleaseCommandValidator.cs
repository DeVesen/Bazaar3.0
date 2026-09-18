using FluentValidation;

namespace Bazaar.Application.Release;

public sealed class ReleaseCommandValidator : AbstractValidator<ReleaseCommand>
{
    public ReleaseCommandValidator()
    {
        RuleFor(x => x.SellerId).NotEmpty();
        RuleFor(x => x.ArticleIds).NotEmpty();
    }
}
