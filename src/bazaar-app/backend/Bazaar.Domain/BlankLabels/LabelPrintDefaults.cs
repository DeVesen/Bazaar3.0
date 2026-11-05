namespace Bazaar.Domain.BlankLabels;

/// <summary>
/// Logo, Verkäufer-Symbol, Währungssymbol und Elementgrößen (mm) des letzten Etiketten-Vordrucks;
/// eine Zeile für alle Geräte. Startnummer, Anzahl und Startposition werden bewusst nie gemerkt.
/// </summary>
public sealed class LabelPrintDefaults
{
    public const int FixedId = 1;
    public const string DefaultCurrencySymbol = "€";
    public const int CurrencySymbolMaxLength = 3;
    public const decimal DefaultQrCodeSize = 21.5m;
    public const decimal DefaultSellerSymbolSize = 5m;
    public const decimal DefaultNumberHeight = 10.5m;
    public const decimal DefaultCurrencyHeight = 12m;
    public const decimal MinSize = 0.1m;
    public const decimal MaxSize = 100m;

    public int Id { get; private init; }
    public LabelGraphicKind? LogoKind { get; private set; }
    public string? LogoValue { get; private set; }
    public LabelGraphicKind? SellerSymbolKind { get; private set; }
    public string? SellerSymbolValue { get; private set; }
    public string CurrencySymbol { get; private set; } = DefaultCurrencySymbol;
    public decimal QrCodeSize { get; private set; } = DefaultQrCodeSize;
    public decimal SellerSymbolSize { get; private set; } = DefaultSellerSymbolSize;
    public decimal NumberHeight { get; private set; } = DefaultNumberHeight;
    public decimal CurrencyHeight { get; private set; } = DefaultCurrencyHeight;

    public LabelGraphic? Logo => ToGraphic(LogoKind, LogoValue);
    public LabelGraphic? SellerSymbol => ToGraphic(SellerSymbolKind, SellerSymbolValue);

    public static LabelPrintDefaults CreateInitial() => new() { Id = FixedId };

    public void Update(
        LabelGraphic? logo,
        LabelGraphic? sellerSymbol,
        string currencySymbol,
        decimal qrCodeSize,
        decimal sellerSymbolSize,
        decimal numberHeight,
        decimal currencyHeight)
    {
        EnsureValidGraphic(logo, nameof(logo));
        EnsureValidGraphic(sellerSymbol, nameof(sellerSymbol));
        if (!IsValidCurrencySymbol(currencySymbol)) throw new ArgumentOutOfRangeException(nameof(currencySymbol));
        EnsureValidSize(qrCodeSize, nameof(qrCodeSize));
        EnsureValidSize(sellerSymbolSize, nameof(sellerSymbolSize));
        EnsureValidSize(numberHeight, nameof(numberHeight));
        EnsureValidSize(currencyHeight, nameof(currencyHeight));
        LogoKind = logo?.Kind;
        LogoValue = logo?.Value;
        SellerSymbolKind = sellerSymbol?.Kind;
        SellerSymbolValue = sellerSymbol?.Value;
        CurrencySymbol = currencySymbol;
        QrCodeSize = qrCodeSize;
        SellerSymbolSize = sellerSymbolSize;
        NumberHeight = numberHeight;
        CurrencyHeight = currencyHeight;
    }

    /// <summary>1 bis 3 Zeichen, gezählt als Unicode-Zeichen (Runes), wie im Frontend.</summary>
    public static bool IsValidCurrencySymbol(string? currencySymbol) =>
        currencySymbol is not null && currencySymbol.EnumerateRunes().Count() is >= 1 and <= CurrencySymbolMaxLength;

    /// <summary>Größe in mm von 0,1 bis 100 mit höchstens einer Nachkommastelle, wie Bogenformat-Maße.</summary>
    public static bool IsValidSize(decimal size) =>
        size is >= MinSize and <= MaxSize && LabelSheetGeometry.HasAtMostOneDecimal(size);

    private static void EnsureValidSize(decimal size, string paramName)
    {
        if (!IsValidSize(size)) throw new ArgumentOutOfRangeException(paramName);
    }

    private static void EnsureValidGraphic(LabelGraphic? graphic, string paramName)
    {
        if (graphic is not null && !graphic.IsValid()) throw new ArgumentException("Invalid label graphic.", paramName);
    }

    private static LabelGraphic? ToGraphic(LabelGraphicKind? kind, string? value) =>
        kind is { } graphicKind && value is not null ? new LabelGraphic(graphicKind, value) : null;
}
