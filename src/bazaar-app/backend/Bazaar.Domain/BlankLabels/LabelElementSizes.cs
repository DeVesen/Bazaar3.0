namespace Bazaar.Domain.BlankLabels;

/// <summary>
/// Größen der Etikett-Elemente in mm: Kantenlänge von QR-Code und Verkäufer-Symbol, Höhe von
/// Artikel-Nummer und Währung. Jede Größe liegt von 0,1 bis 100 mit höchstens einer Nachkommastelle.
/// </summary>
public sealed record LabelElementSizes(decimal QrCode, decimal SellerSymbol, decimal NumberHeight, decimal CurrencyHeight)
{
    public const decimal MinSize = 0.1m;
    public const decimal MaxSize = 100m;

    /// <summary>Vorgaben ohne gespeicherte Druck-Vorgaben (erstes Öffnen).</summary>
    public static LabelElementSizes Default { get; } = new(QrCode: 21.5m, SellerSymbol: 5m, NumberHeight: 10.5m, CurrencyHeight: 12m);

    /// <summary>Größe in mm von 0,1 bis 100 mit höchstens einer Nachkommastelle, wie Bogenformat-Maße.</summary>
    public static bool IsValidSize(decimal size) =>
        size is >= MinSize and <= MaxSize && LabelSheetGeometry.HasAtMostOneDecimal(size);

    public bool IsValid() =>
        IsValidSize(QrCode) && IsValidSize(SellerSymbol) && IsValidSize(NumberHeight) && IsValidSize(CurrencyHeight);
}
