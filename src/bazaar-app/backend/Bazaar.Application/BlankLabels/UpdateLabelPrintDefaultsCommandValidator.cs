using System.Globalization;
using System.Linq.Expressions;
using Bazaar.Domain.BlankLabels;
using FluentValidation;

namespace Bazaar.Application.BlankLabels;

public sealed class UpdateLabelPrintDefaultsCommandValidator : AbstractValidator<UpdateLabelPrintDefaultsCommand>
{
    /// <summary>Fehler-Schlüssel der Größen im Problem-Body, wie die Felder im JSON-Vertrag heißen.</summary>
    public const string QrCodeKey = "sizes.qrCode";
    public const string SellerSymbolKey = "sizes.sellerSymbol";
    public const string NumberHeightKey = "sizes.numberHeight";
    public const string CurrencyHeightKey = "sizes.currencyHeight";

    private const string GraphicMessage = "Icon aus der Liste oder Bild als PNG, JPEG oder SVG bis 1 MB";
    private const string SizesRequiredMessage = "Elementgrößen fehlen";

    private static readonly CultureInfo German = CultureInfo.GetCultureInfo("de-DE");

    private static readonly string SizeMessage =
        $"Zahl von {FormatSize(LabelElementSizes.MinSize)} bis {FormatSize(LabelElementSizes.MaxSize)} mit höchstens 1 Nachkommastelle";

    public UpdateLabelPrintDefaultsCommandValidator()
    {
        RuleFor(x => x.Logo).Must(IsEmptyOrValid).WithMessage(GraphicMessage);
        RuleFor(x => x.SellerSymbol).Must(IsEmptyOrValid).WithMessage(GraphicMessage);
        RuleFor(x => x.CurrencySymbol)
            .Must(LabelPrintDefaults.IsValidCurrencySymbol)
            .WithMessage($"1 bis {LabelPrintDefaults.CurrencySymbolMaxLength} Zeichen");
        RuleFor(x => x.Sizes).NotNull().WithMessage(SizesRequiredMessage);
        When(x => x.Sizes is not null, () =>
        {
            SizeRule(x => x.Sizes!.QrCode, QrCodeKey);
            SizeRule(x => x.Sizes!.SellerSymbol, SellerSymbolKey);
            SizeRule(x => x.Sizes!.NumberHeight, NumberHeightKey);
            SizeRule(x => x.Sizes!.CurrencyHeight, CurrencyHeightKey);
        });
    }

    private void SizeRule(Expression<Func<UpdateLabelPrintDefaultsCommand, decimal>> size, string errorKey) =>
        RuleFor(size).Must(LabelElementSizes.IsValidSize).WithMessage(SizeMessage).OverridePropertyName(errorKey);

    private static string FormatSize(decimal size) => size.ToString("0.#", German);

    private static bool IsEmptyOrValid(LabelGraphic? graphic) => graphic is null || graphic.IsValid();
}
