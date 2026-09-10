using FluentValidation;

namespace BAR.Application.Blocks.Reserve;

public sealed class ReserveBlocksCommandValidator : AbstractValidator<ReserveBlocksCommand>
{
    public ReserveBlocksCommandValidator()
    {
        // BlockCount ist optional (null -> Settings-Default) - nur ein
        // explizit mitgeschickter Wert wird geprueft.
        RuleFor(c => c.BlockCount).GreaterThanOrEqualTo(1).When(c => c.BlockCount.HasValue);
    }
}
