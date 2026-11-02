namespace Bazaar.Domain.BlankLabels;

/// <summary>
/// Maße eines Etikettenbogens in mm (Bogenformat ohne Namen). Etikett- und Bogengröße sind
/// größer als 0, Ränder und Abstände mindestens 0, alle Maße mit höchstens einer
/// Nachkommastelle; Spalten und Zeilen ganzzahlig ab 1.
/// </summary>
public sealed record LabelSheetGeometry(
    decimal SheetWidth,
    decimal SheetHeight,
    decimal LabelWidth,
    decimal LabelHeight,
    decimal MarginTop,
    decimal MarginRight,
    decimal MarginBottom,
    decimal MarginLeft,
    decimal GapHorizontal,
    decimal GapVertical,
    int Columns,
    int Rows)
{
    /// <summary>So weit darf das Raster den Bogen überragen, ohne als widersprüchlich zu gelten.</summary>
    public const decimal FitToleranceMm = 0.5m;

    public bool HasValidMeasures() =>
        AreAll(IsPositiveMeasure, SheetWidth, SheetHeight, LabelWidth, LabelHeight)
        && AreAll(IsNonNegativeMeasure, MarginTop, MarginRight, MarginBottom, MarginLeft, GapHorizontal, GapVertical)
        && Columns >= 1
        && Rows >= 1;

    public bool FitsSheetWidth() =>
        Columns * LabelWidth + (Columns - 1) * GapHorizontal + MarginLeft + MarginRight
        <= SheetWidth + FitToleranceMm;

    public bool FitsSheetHeight() =>
        Rows * LabelHeight + (Rows - 1) * GapVertical + MarginTop + MarginBottom
        <= SheetHeight + FitToleranceMm;

    public static bool HasAtMostOneDecimal(decimal value) => decimal.Round(value, 1) == value;

    private static bool IsPositiveMeasure(decimal value) => value > 0 && HasAtMostOneDecimal(value);

    private static bool IsNonNegativeMeasure(decimal value) => value >= 0 && HasAtMostOneDecimal(value);

    private static bool AreAll(Func<decimal, bool> rule, params decimal[] values) => values.All(rule);
}
