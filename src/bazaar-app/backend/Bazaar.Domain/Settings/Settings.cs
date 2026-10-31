namespace Bazaar.Domain.Settings;

public sealed class Settings
{
    public const int FixedId = 1;

    public int Id { get; private init; }
    public int ScannerPauseMs { get; private set; }
    public PrintTexts AbgabeBeleg { get; private set; } = PrintTexts.CreateEmpty();
    public PrintTexts VerkaeuferUebersicht { get; private set; } = PrintTexts.CreateEmpty();
    public AushangTexts ArticleAushang { get; private set; } = AushangTexts.CreateEmpty();

    /// <summary>
    /// true = das Freigeben-Popup gibt Artikel erst beim Schließen frei (Verhalten wie bisher),
    /// false = bei Verkäufern ohne Gebühr wird jeder erfasste Artikel sofort freigegeben.
    /// </summary>
    public bool ReleaseOnClose { get; private set; } = true;

    /// <summary>
    /// Verkäufer-Typ, den „Neuer Verkäufer" und die Artikelannahme vorbelegen;
    /// null = der am häufigsten zugewiesene Typ wird vorgeschlagen.
    /// </summary>
    public string? DefaultSellerTypeId { get; private set; }

    public static Settings Create(int scannerPauseMs)
    {
        EnsureValidScannerPauseMs(scannerPauseMs);
        return new Settings
        {
            Id = FixedId,
            ScannerPauseMs = scannerPauseMs
        };
    }

    public void Update(int scannerPauseMs, bool releaseOnClose)
    {
        EnsureValidScannerPauseMs(scannerPauseMs);
        ScannerPauseMs = scannerPauseMs;
        ReleaseOnClose = releaseOnClose;
    }

    public void ChangeDefaultSellerType(string? sellerTypeId)
    {
        DefaultSellerTypeId = string.IsNullOrWhiteSpace(sellerTypeId) ? null : sellerTypeId;
    }

    /// <summary>Leert den Standard nur, wenn er auf den gelöschten Typ zeigt.</summary>
    /// <returns>true, wenn sich der Standard geändert hat.</returns>
    public bool ClearDefaultSellerTypeIf(string sellerTypeId)
    {
        if (DefaultSellerTypeId != sellerTypeId) return false;
        DefaultSellerTypeId = null;
        return true;
    }

    public void UpdatePrintTexts(PrintTexts abgabeBeleg, PrintTexts verkaeuferUebersicht, AushangTexts articleAushang)
    {
        ArgumentNullException.ThrowIfNull(abgabeBeleg);
        ArgumentNullException.ThrowIfNull(verkaeuferUebersicht);
        ArgumentNullException.ThrowIfNull(articleAushang);
        EnsureValidTexts(abgabeBeleg.All());
        EnsureValidTexts(verkaeuferUebersicht.All());
        EnsureValidTexts(articleAushang.All());
        AbgabeBeleg = abgabeBeleg with { };
        VerkaeuferUebersicht = verkaeuferUebersicht with { };
        ArticleAushang = articleAushang with { };
    }

    private static void EnsureValidTexts(IEnumerable<string> texts)
    {
        foreach (var text in texts)
        {
            ArgumentNullException.ThrowIfNull(text);
            if (text.Length > PrintTexts.MaxLength) throw new ArgumentOutOfRangeException(nameof(texts));
        }
    }

    private static void EnsureValidScannerPauseMs(int scannerPauseMs)
    {
        if (scannerPauseMs is < 500 or > 15000) throw new ArgumentOutOfRangeException(nameof(scannerPauseMs));
    }
}
