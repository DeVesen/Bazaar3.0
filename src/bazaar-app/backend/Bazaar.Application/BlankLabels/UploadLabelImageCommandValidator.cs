using Bazaar.Domain.BlankLabels;
using FluentValidation;

namespace Bazaar.Application.BlankLabels;

public sealed class UploadLabelImageCommandValidator : AbstractValidator<UploadLabelImageCommand>
{
    public UploadLabelImageCommandValidator()
    {
        RuleFor(x => x.Name)
            .Must(name => !string.IsNullOrWhiteSpace(name)).WithMessage("Name fehlt")
            .Must(name => (name ?? string.Empty).Trim().Length <= LabelImage.NameMaxLength)
            .WithMessage($"Höchstens {LabelImage.NameMaxLength} Zeichen");
        RuleFor(x => x.DataUrl)
            .Must(LabelGraphic.IsValidImageDataUrl)
            .WithMessage("Bild als PNG, JPEG oder SVG bis 1 MB");
    }
}
