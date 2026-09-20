using FluentValidation;

namespace Bazaar.Application.Settings;

public sealed class UpdateSettingsCommandValidator : AbstractValidator<UpdateSettingsCommand>
{
    public UpdateSettingsCommandValidator()
    {
        RuleFor(x => x.ScannerPauseMs).InclusiveBetween(500, 15000);
    }
}
