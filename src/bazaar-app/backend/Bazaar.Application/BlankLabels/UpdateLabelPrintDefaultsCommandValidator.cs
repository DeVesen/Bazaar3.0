using Bazaar.Domain.BlankLabels;
using FluentValidation;

namespace Bazaar.Application.BlankLabels;

public sealed class UpdateLabelPrintDefaultsCommandValidator : AbstractValidator<UpdateLabelPrintDefaultsCommand>
{
    private const string GraphicMessage = "Icon aus der Liste oder Bild als PNG, JPEG oder SVG bis 1 MB";

    public UpdateLabelPrintDefaultsCommandValidator()
    {
        RuleFor(x => x.Logo).Must(IsEmptyOrValid).WithMessage(GraphicMessage);
        RuleFor(x => x.SellerSymbol).Must(IsEmptyOrValid).WithMessage(GraphicMessage);
        RuleFor(x => x.CurrencySymbol)
            .Must(LabelPrintDefaults.IsValidCurrencySymbol)
            .WithMessage($"1 bis {LabelPrintDefaults.CurrencySymbolMaxLength} Zeichen");
    }

    private static bool IsEmptyOrValid(LabelGraphic? graphic) => graphic is null || graphic.IsValid();
}
