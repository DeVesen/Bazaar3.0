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

    public int Id { get; private init; }
    public LabelGraphicKind? LogoKind { get; private set; }
    public string? LogoValue { get; private set; }
    public LabelGraphicKind? SellerSymbolKind { get; private set; }
    public string? SellerSymbolValue { get; private set; }
    public string CurrencySymbol { get; private set; } = DefaultCurrencySymbol;
    public LabelElementSizes Sizes { get; private set; } = LabelElementSizes.Default;

    public LabelGraphic? Logo => ToGraphic(LogoKind, LogoValue);
    public LabelGraphic? SellerSymbol => ToGraphic(SellerSymbolKind, SellerSymbolValue);

    public static LabelPrintDefaults CreateInitial() => new() { Id = FixedId };

    public void Update(
        LabelGraphic? logo,
        LabelGraphic? sellerSymbol,
        string currencySymbol,
        LabelElementSizes sizes)
    {
        EnsureValidGraphic(logo, nameof(logo));
        EnsureValidGraphic(sellerSymbol, nameof(sellerSymbol));
        if (!IsValidCurrencySymbol(currencySymbol)) throw new ArgumentOutOfRangeException(nameof(currencySymbol));
        ArgumentNullException.ThrowIfNull(sizes);
        if (!sizes.IsValid()) throw new ArgumentOutOfRangeException(nameof(sizes));
        LogoKind = logo?.Kind;
        LogoValue = logo?.Value;
        SellerSymbolKind = sellerSymbol?.Kind;
        SellerSymbolValue = sellerSymbol?.Value;
        CurrencySymbol = currencySymbol;
        Sizes = sizes;
    }

    /// <summary>1 bis 3 Zeichen, gezählt als Unicode-Zeichen (Runes), wie im Frontend.</summary>
    public static bool IsValidCurrencySymbol(string? currencySymbol) =>
        currencySymbol is not null && currencySymbol.EnumerateRunes().Count() is >= 1 and <= CurrencySymbolMaxLength;

    private static void EnsureValidGraphic(LabelGraphic? graphic, string paramName)
    {
        if (graphic is not null && !graphic.IsValid()) throw new ArgumentException("Invalid label graphic.", paramName);
    }

    private static LabelGraphic? ToGraphic(LabelGraphicKind? kind, string? value) =>
        kind is { } graphicKind && value is not null ? new LabelGraphic(graphicKind, value) : null;
}
