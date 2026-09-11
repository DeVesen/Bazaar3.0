using BAR.Modules.Betrieb.Contracts;
using BAR.Modules.Stammdaten.Contracts;
using FluentValidation;

namespace BAR.Modules.Betrieb.Application.Settings.Update;

public sealed class UpdateSettingsCommandValidator : AbstractValidator<UpdateSettingsCommand>
{
    public UpdateSettingsCommandValidator(IStammdatenModuleApi stammdaten)
    {
        RuleFor(c => c.StartNumber).GreaterThan(0);
        RuleFor(c => c.BlockSize).GreaterThan(0);
        RuleFor(c => c.DefaultBlockCount).GreaterThan(0);
        RuleFor(c => c.DefaultTypeId)
            .MustAsync(async (id, ct) => id is null || await stammdaten.SellerTypeExistsAsync(id, ct))
            .WithMessage("Unbekannter Verkäufer-Typ");
    }
}
