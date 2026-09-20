using SettingsAggregate = Bazaar.Domain.Settings.Settings;

namespace Bazaar.Domain.UnitTests;

public class SettingsTests
{
    [Theory]
    [InlineData(499)]
    [InlineData(15001)]
    public void Create_WithScannerPauseMsOutOfRange_Throws(int scannerPauseMs)
    {
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            SettingsAggregate.Create(scannerPauseMs));
    }

    [Theory]
    [InlineData(500)]
    [InlineData(15000)]
    public void Create_WithScannerPauseMsAtBoundary_Succeeds(int scannerPauseMs)
    {
        var settings = SettingsAggregate.Create(scannerPauseMs);

        Assert.Equal(scannerPauseMs, settings.ScannerPauseMs);
    }

    [Fact]
    public void Create_WithValidData_SetsIdAndScannerPauseMs()
    {
        var settings = SettingsAggregate.Create(3000);

        Assert.Equal(SettingsAggregate.FixedId, settings.Id);
        Assert.Equal(3000, settings.ScannerPauseMs);
    }

    [Theory]
    [InlineData(499)]
    [InlineData(15001)]
    public void Update_WithScannerPauseMsOutOfRange_Throws(int scannerPauseMs)
    {
        var settings = SettingsAggregate.Create(3000);

        Assert.Throws<ArgumentOutOfRangeException>(() => settings.Update(scannerPauseMs));
    }

    [Theory]
    [InlineData(500)]
    [InlineData(15000)]
    public void Update_WithScannerPauseMsAtBoundary_Succeeds(int scannerPauseMs)
    {
        var settings = SettingsAggregate.Create(3000);

        settings.Update(scannerPauseMs);

        Assert.Equal(scannerPauseMs, settings.ScannerPauseMs);
    }
}
