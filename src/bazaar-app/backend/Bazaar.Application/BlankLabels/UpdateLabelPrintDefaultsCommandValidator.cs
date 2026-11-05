using Bazaar.Domain.BlankLabels;
using FluentValidation;

namespace Bazaar.Application.BlankLabels;

public sealed class UpdateLabelPrintDefaultsCommandValidator : AbstractValidator<UpdateLabelPrintDefaultsCommand>
{
    private const string GraphicMessage = "Icon aus der Liste oder Bild als PNG, JPEG oder SVG bis 1 MB";
    private const string SizeMessage = "Zahl von 0,1 bis 100 mit höchstens 1 Nachkommastelle";

    public UpdateLabelPrintDefaultsCommandValidator()
    {
        RuleFor(x => x.Logo).Must(IsEmptyOrValid).WithMessage(GraphicMessage);
        RuleFor(x => x.SellerSymbol).Must(IsEmptyOrValid).WithMessage(GraphicMessage);
        RuleFor(x => x.CurrencySymbol)
            .Must(LabelPrintDefaults.IsValidCurrencySymbol)
            .WithMessage($"1 bis {LabelPrintDefaults.CurrencySymbolMaxLength} Zeichen");
        RuleFor(x => x.QrCodeSize).Must(LabelPrintDefaults.IsValidSize).WithMessage(SizeMessage);
        RuleFor(x => x.SellerSymbolSize).Must(LabelPrintDefaults.IsValidSize).WithMessage(SizeMessage);
        RuleFor(x => x.NumberHeight).Must(LabelPrintDefaults.IsValidSize).WithMessage(SizeMessage);
        RuleFor(x => x.CurrencyHeight).Must(LabelPrintDefaults.IsValidSize).WithMessage(SizeMessage);
    }

    private static bool IsEmptyOrValid(LabelGraphic? graphic) => graphic is null || graphic.IsValid();
}
