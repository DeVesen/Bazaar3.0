using FluentValidation;

namespace Bazaar.Application.Sales;

public sealed class UndoSaleCommandValidator : AbstractValidator<UndoSaleCommand>
{
    public UndoSaleCommandValidator()
    {
        RuleFor(x => x.ArticleIds).NotEmpty();
    }
}
