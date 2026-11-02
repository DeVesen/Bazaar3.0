using System.Linq.Expressions;
using Bazaar.Domain.BlankLabels;
using FluentValidation;

namespace Bazaar.Application.BlankLabels;

public sealed class SaveLabelSheetFormatCommandValidator : AbstractValidator<SaveLabelSheetFormatCommand>
{
    private const string OneDecimalMessage = "Höchstens eine Nachkommastelle";

    /// <summary>Obergrenze je Maß in mm; schützt die Rasterprüfung vor decimal-Überlauf.</summary>
    private const decimal MaxMeasureMm = 10_000m;

    /// <summary>Obergrenze für Spalten und Zeilen; schützt die Rasterprüfung vor Überlauf.</summary>
    private const int MaxGridCount = 1_000;

    public SaveLabelSheetFormatCommandValidator()
    {
        RuleFor(x => x.Name)
            .Must(name => !string.IsNullOrWhiteSpace(name)).WithMessage("Name fehlt")
            .Must(name => (name ?? string.Empty).Trim().Length <= LabelSheetFormat.NameMaxLength)
            .WithMessage($"Höchstens {LabelSheetFormat.NameMaxLength} Zeichen");

        PositiveMeasure(x => x.SheetWidth);
        PositiveMeasure(x => x.SheetHeight);
        PositiveMeasure(x => x.LabelWidth);
        PositiveMeasure(x => x.LabelHeight);
        NonNegativeMeasure(x => x.MarginTop);
        NonNegativeMeasure(x => x.MarginRight);
        NonNegativeMeasure(x => x.MarginBottom);
        NonNegativeMeasure(x => x.MarginLeft);
        NonNegativeMeasure(x => x.GapHorizontal);
        NonNegativeMeasure(x => x.GapVertical);
        RuleFor(x => x.Columns).InclusiveBetween(1, MaxGridCount);
        RuleFor(x => x.Rows).InclusiveBetween(1, MaxGridCount);

        When(IsWithinBoundsAndValid, () =>
        {
            RuleFor(x => x.Columns)
                .Must((command, _) => command.ToGeometry().FitsSheetWidth())
                .WithMessage("Etiketten passen nicht in die Bogenbreite");
            RuleFor(x => x.Rows)
                .Must((command, _) => command.ToGeometry().FitsSheetHeight())
                .WithMessage("Etiketten passen nicht in die Bogenhöhe");
        });
    }

    private static bool IsWithinBoundsAndValid(SaveLabelSheetFormatCommand command) =>
        command.ToGeometry().HasValidMeasures()
        && command.Columns <= MaxGridCount
        && command.Rows <= MaxGridCount
        && AllMeasures(command).All(measure => measure <= MaxMeasureMm);

    private static decimal[] AllMeasures(SaveLabelSheetFormatCommand command) =>
    [
        command.SheetWidth, command.SheetHeight, command.LabelWidth, command.LabelHeight,
        command.MarginTop, command.MarginRight, command.MarginBottom, command.MarginLeft,
        command.GapHorizontal, command.GapVertical,
    ];

    private void PositiveMeasure(Expression<Func<SaveLabelSheetFormatCommand, decimal>> measure) =>
        RuleFor(measure).GreaterThan(0).LessThanOrEqualTo(MaxMeasureMm)
            .Must(LabelSheetGeometry.HasAtMostOneDecimal).WithMessage(OneDecimalMessage);

    private void NonNegativeMeasure(Expression<Func<SaveLabelSheetFormatCommand, decimal>> measure) =>
        RuleFor(measure).GreaterThanOrEqualTo(0).LessThanOrEqualTo(MaxMeasureMm)
            .Must(LabelSheetGeometry.HasAtMostOneDecimal).WithMessage(OneDecimalMessage);
}
