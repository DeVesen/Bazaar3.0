using Bazaar.Domain.Settings;
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

        Assert.Throws<ArgumentOutOfRangeException>(() => settings.Update(scannerPauseMs, true));
    }

    [Theory]
    [InlineData(500)]
    [InlineData(15000)]
    public void Update_WithScannerPauseMsAtBoundary_Succeeds(int scannerPauseMs)
    {
        var settings = SettingsAggregate.Create(3000);

        settings.Update(scannerPauseMs, true);

        Assert.Equal(scannerPauseMs, settings.ScannerPauseMs);
    }

    [Fact]
    public void Create_Always_StartsWithEmptyPrintTexts()
    {
        // Arrange & Act
        var settings = SettingsAggregate.Create(3000);

        // Assert
        Assert.Equal(PrintTexts.CreateEmpty(), settings.AbgabeBeleg);
        Assert.Equal(PrintTexts.CreateEmpty(), settings.VerkaeuferUebersicht);
    }

    [Fact]
    public void UpdatePrintTexts_ValidTexts_ReplacesBothTextSets()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var abgabeBeleg = new PrintTexts("a1", "a2", "a3", "a4", "a5");
        var verkaeuferUebersicht = new PrintTexts("v1", "v2", "v3", "v4", "v5");

        // Act
        settings.UpdatePrintTexts(abgabeBeleg, verkaeuferUebersicht);

        // Assert
        Assert.Equal(abgabeBeleg, settings.AbgabeBeleg);
        Assert.Equal(verkaeuferUebersicht, settings.VerkaeuferUebersicht);
    }

    [Fact]
    public void UpdatePrintTexts_TextLongerThanMaxLength_Throws()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var tooLong = new PrintTexts("", "", new string('x', PrintTexts.MaxLength + 1), "", "");

        // Act & Assert
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            settings.UpdatePrintTexts(tooLong, PrintTexts.CreateEmpty()));
    }

    [Fact]
    public void UpdatePrintTexts_TextAtMaxLength_Succeeds()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var atLimit = new PrintTexts(new string('x', PrintTexts.MaxLength), "", "", "", "");

        // Act
        settings.UpdatePrintTexts(PrintTexts.CreateEmpty(), atLimit);

        // Assert
        Assert.Equal(PrintTexts.MaxLength, settings.VerkaeuferUebersicht.Text1.Length);
    }

    [Fact]
    public void UpdatePrintTexts_NullText_Throws()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var withNull = new PrintTexts(null!, "", "", "", "");

        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            settings.UpdatePrintTexts(withNull, PrintTexts.CreateEmpty()));
    }

    [Fact]
    public void Create_Always_StartsWithReleaseOnCloseEnabled()
    {
        // Arrange & Act
        var settings = SettingsAggregate.Create(3000);

        // Assert
        Assert.True(settings.ReleaseOnClose);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Update_ReleaseOnCloseValue_IsStored(bool releaseOnClose)
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);

        // Act
        settings.Update(3000, releaseOnClose);

        // Assert
        Assert.Equal(releaseOnClose, settings.ReleaseOnClose);
    }
}
