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
    int Rows,
    decimal OffsetX,
    decimal OffsetY)
{
    public static LabelSheetFormatDto From(LabelSheetFormat format)
    {
        var geometry = format.Geometry;
        return new LabelSheetFormatDto(
            format.Id, format.Name,
            geometry.SheetWidth, geometry.SheetHeight, geometry.LabelWidth, geometry.LabelHeight,
            geometry.MarginTop, geometry.MarginRight, geometry.MarginBottom, geometry.MarginLeft,
            geometry.GapHorizontal, geometry.GapVertical, geometry.Columns, geometry.Rows,
            geometry.OffsetX, geometry.OffsetY);
    }
}

public sealed record LabelImageSummaryDto(string Id, string Name, string MediaType, int SizeBytes, DateTimeOffset CreatedAt)
{
    public static LabelImageSummaryDto From(LabelImageSummary summary) =>
        new(summary.Id, summary.Name, summary.MediaType, summary.SizeBytes, summary.CreatedAt);

    public static LabelImageSummaryDto From(LabelImage image) =>
        new(image.Id, image.Name, image.MediaType, image.SizeBytes, image.CreatedAt);
}

/// <summary>Einzelnes Bild mit Inhalt; wird nur als JSON ausgeliefert, nie als eigenes Dokument.</summary>
public sealed record LabelImageDto(string Id, string Name, string DataUrl)
{
    public static LabelImageDto From(LabelImage image) => new(image.Id, image.Name, image.DataUrl);
}

public sealed record LabelPrintDefaultsDto(LabelGraphic? Logo, LabelGraphic? SellerSymbol, string CurrencySymbol)
{
    public static LabelPrintDefaultsDto From(LabelPrintDefaults defaults) =>
        new(defaults.Logo, defaults.SellerSymbol, defaults.CurrencySymbol);
}
