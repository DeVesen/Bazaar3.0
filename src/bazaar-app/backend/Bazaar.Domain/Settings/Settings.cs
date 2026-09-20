namespace Bazaar.Domain.Settings;

public sealed class Settings
{
    public const int FixedId = 1;

    public int Id { get; private init; }
    public int ScannerPauseMs { get; private set; }

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

    private static void EnsureValidScannerPauseMs(int scannerPauseMs)
    {
        if (scannerPauseMs is < 500 or > 15000) throw new ArgumentOutOfRangeException(nameof(scannerPauseMs));
    }
}
