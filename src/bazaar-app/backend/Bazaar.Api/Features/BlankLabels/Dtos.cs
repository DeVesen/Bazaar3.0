using Bazaar.Domain.BlankLabels;

namespace Bazaar.Api.Features.BlankLabels;

public sealed record LabelSheetFormatDto(
    string Id,
    string Name,
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
    public static LabelSheetFormatDto From(LabelSheetFormat format)
    {
        var geometry = format.Geometry;
        return new LabelSheetFormatDto(
            format.Id, format.Name,
            geometry.SheetWidth, geometry.SheetHeight, geometry.LabelWidth, geometry.LabelHeight,
            geometry.MarginTop, geometry.MarginRight, geometry.MarginBottom, geometry.MarginLeft,
            geometry.GapHorizontal, geometry.GapVertical, geometry.Columns, geometry.Rows);
    }
}

public sealed record LabelPrintDefaultsDto(LabelGraphic? Logo, LabelGraphic? SellerSymbol, string CurrencySymbol)
{
    public static LabelPrintDefaultsDto From(LabelPrintDefaults defaults) =>
        new(defaults.Logo, defaults.SellerSymbol, defaults.CurrencySymbol);
}
