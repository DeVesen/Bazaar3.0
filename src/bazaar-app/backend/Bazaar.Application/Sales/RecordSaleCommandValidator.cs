using FluentValidation;

namespace Bazaar.Application.Sales;

public sealed class RecordSaleCommandValidator : AbstractValidator<RecordSaleCommand>
{
    public RecordSaleCommandValidator()
    {
        RuleFor(x => x.ArticleIds).NotEmpty();
    }
}
