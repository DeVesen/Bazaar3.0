using Bazaar.Domain.BlankLabels;

namespace Bazaar.Application.BlankLabels;

/// <summary>Body von PUT /api/label-print-defaults; die Seite sendet ihn bei jedem Druck.</summary>
public sealed class UpdateLabelPrintDefaultsCommand
{
    public LabelGraphic? Logo { get; set; }
    public LabelGraphic? SellerSymbol { get; set; }
    public string CurrencySymbol { get; set; } = string.Empty;
}
