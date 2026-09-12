using BAR.Modules.Operations.Contracts;
using BAR.Modules.MasterData.Contracts;
using FluentValidation;

namespace BAR.Modules.Operations.Application.Settings.Update;

public sealed class UpdateSettingsCommandValidator : AbstractValidator<UpdateSettingsCommand>
{
    public UpdateSettingsCommandValidator(IMasterDataModuleApi masterData)
    {
        RuleFor(c => c.StartNumber).GreaterThan(0);
        RuleFor(c => c.BlockSize).GreaterThan(0);
        RuleFor(c => c.DefaultBlockCount).GreaterThan(0);
        RuleFor(c => c.DefaultTypeId)
            .MustAsync(async (id, ct) => id is null || await masterData.SellerTypeExistsAsync(id, ct))
            .WithMessage("Unbekannter Verkäufer-Typ");
    }
}
