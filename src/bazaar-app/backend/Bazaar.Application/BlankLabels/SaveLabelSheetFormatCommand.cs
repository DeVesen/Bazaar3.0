using Bazaar.Domain.BlankLabels;

namespace Bazaar.Application.BlankLabels;

/// <summary>
/// Body von POST /api/label-sheet-formats. <see cref="Overwrite"/> = true ersetzt ein Format
/// mit exakt gleichem Namen, nachdem die Seite „Überschreiben?" bestätigt hat.
/// </summary>
public sealed class SaveLabelSheetFormatCommand
{
    public string Name { get; set; } = string.Empty;
    public decimal SheetWidth { get; set; }
    public decimal SheetHeight { get; set; }
    public decimal LabelWidth { get; set; }
    public decimal LabelHeight { get; set; }
    public decimal MarginTop { get; set; }
    public decimal MarginRight { get; set; }
    public decimal MarginBottom { get; set; }
    public decimal MarginLeft { get; set; }
    public decimal GapHorizontal { get; set; }
    public decimal GapVertical { get; set; }
    public int Columns { get; set; }
    public int Rows { get; set; }
    public decimal OffsetX { get; set; }
    public decimal OffsetY { get; set; }
    public bool Overwrite { get; set; }

    public LabelSheetGeometry ToGeometry() => new(
        SheetWidth, SheetHeight, LabelWidth, LabelHeight,
        MarginTop, MarginRight, MarginBottom, MarginLeft,
        GapHorizontal, GapVertical, Columns, Rows,
        OffsetX, OffsetY);
}
