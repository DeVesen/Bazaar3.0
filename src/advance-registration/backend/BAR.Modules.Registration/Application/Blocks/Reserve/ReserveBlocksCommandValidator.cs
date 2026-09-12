using BAR.Modules.Registration.Contracts.Blocks;
using FluentValidation;

namespace BAR.Modules.Registration.Application.Blocks.Reserve;

public sealed class ReserveBlocksCommandValidator : AbstractValidator<ReserveBlocksCommand>
{
    public ReserveBlocksCommandValidator()
    {
        RuleFor(c => c.BlockCount).GreaterThanOrEqualTo(1).When(c => c.BlockCount.HasValue);
    }
}
