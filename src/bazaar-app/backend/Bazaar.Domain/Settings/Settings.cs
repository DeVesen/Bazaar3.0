namespace Bazaar.Domain.Settings;

public sealed class Settings
{
    public const int FixedId = 1;

    public int Id { get; private init; }
    public int ScannerPauseMs { get; private set; }
    public PrintTexts AbgabeBeleg { get; private set; } = PrintTexts.CreateEmpty();
    public PrintTexts VerkaeuferUebersicht { get; private set; } = PrintTexts.CreateEmpty();

    public static Settings Create(int scannerPauseMs)
    {
        EnsureValidScannerPauseMs(scannerPauseMs);
        return new Settings
        {
            Id = FixedId,
            ScannerPauseMs = scannerPauseMs
        };
    }

    public void Update(int scannerPauseMs)
    {
        EnsureValidScannerPauseMs(scannerPauseMs);
        ScannerPauseMs = scannerPauseMs;
    }

    public void UpdatePrintTexts(PrintTexts abgabeBeleg, PrintTexts verkaeuferUebersicht)
    {
        EnsureValidPrintTexts(abgabeBeleg);
        EnsureValidPrintTexts(verkaeuferUebersicht);
        AbgabeBeleg = abgabeBeleg with { };
        VerkaeuferUebersicht = verkaeuferUebersicht with { };
    }

    private static void EnsureValidPrintTexts(PrintTexts texts)
    {
        ArgumentNullException.ThrowIfNull(texts);
        foreach (var text in texts.All())
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
