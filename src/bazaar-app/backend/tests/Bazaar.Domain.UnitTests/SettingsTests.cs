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
        Assert.Equal(AushangTexts.CreateEmpty(), settings.ArticleAushang);
    }

    [Fact]
    public void UpdatePrintTexts_ValidTexts_ReplacesAllThreeTextSets()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var abgabeBeleg = new PrintTexts("a1", "a2", "a3", "a4", "a5");
        var verkaeuferUebersicht = new PrintTexts("v1", "v2", "v3", "v4", "v5");
        var articleAushang = new AushangTexts("k1", "k2", "f1", "f2");

        // Act
        settings.UpdatePrintTexts(abgabeBeleg, verkaeuferUebersicht, articleAushang);

        // Assert
        Assert.Equal(abgabeBeleg, settings.AbgabeBeleg);
        Assert.Equal(verkaeuferUebersicht, settings.VerkaeuferUebersicht);
        Assert.Equal(articleAushang, settings.ArticleAushang);
    }

    [Fact]
    public void UpdatePrintTexts_TextLongerThanMaxLength_Throws()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var tooLong = new PrintTexts("", "", new string('x', PrintTexts.MaxLength + 1), "", "");

        // Act & Assert
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            settings.UpdatePrintTexts(tooLong, PrintTexts.CreateEmpty(), AushangTexts.CreateEmpty()));
    }

    [Fact]
    public void UpdatePrintTexts_TextAtMaxLength_Succeeds()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var atLimit = new PrintTexts(new string('x', PrintTexts.MaxLength), "", "", "", "");

        // Act
        settings.UpdatePrintTexts(PrintTexts.CreateEmpty(), atLimit, AushangTexts.CreateEmpty());

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
            settings.UpdatePrintTexts(withNull, PrintTexts.CreateEmpty(), AushangTexts.CreateEmpty()));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(1)]
    [InlineData(2)]
    [InlineData(3)]
    public void UpdatePrintTexts_AushangTextLongerThanMaxLength_Throws(int index)
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var texts = new[] { "", "", "", "" };
        texts[index] = new string('x', AushangTexts.MaxLength + 1);
        var tooLong = new AushangTexts(texts[0], texts[1], texts[2], texts[3]);

        // Act & Assert
        Assert.Throws<ArgumentOutOfRangeException>(() =>
            settings.UpdatePrintTexts(PrintTexts.CreateEmpty(), PrintTexts.CreateEmpty(), tooLong));
    }

    [Fact]
    public void UpdatePrintTexts_AushangTextAtMaxLength_Succeeds()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var atLimit = new AushangTexts("", "", "", new string('x', AushangTexts.MaxLength));

        // Act
        settings.UpdatePrintTexts(PrintTexts.CreateEmpty(), PrintTexts.CreateEmpty(), atLimit);

        // Assert
        Assert.Equal(AushangTexts.MaxLength, settings.ArticleAushang.Text4.Length);
    }

    [Fact]
    public void UpdatePrintTexts_NullAushangText_Throws()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        var withNull = new AushangTexts("", null!, "", "");

        // Act & Assert
        Assert.Throws<ArgumentNullException>(() =>
            settings.UpdatePrintTexts(PrintTexts.CreateEmpty(), PrintTexts.CreateEmpty(), withNull));
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

    [Fact]
    public void Create_Always_StartsWithoutDefaultSellerType()
    {
        // Arrange & Act
        var settings = SettingsAggregate.Create(3000);

        // Assert
        Assert.Null(settings.DefaultSellerTypeId);
    }

    [Theory]
    [InlineData(null)]
    [InlineData("")]
    [InlineData("  ")]
    public void ChangeDefaultSellerType_EmptyValue_StoresNull(string? sellerTypeId)
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        settings.ChangeDefaultSellerType("TYPE0001");

        // Act
        settings.ChangeDefaultSellerType(sellerTypeId);

        // Assert
        Assert.Null(settings.DefaultSellerTypeId);
    }

    [Fact]
    public void ClearDefaultSellerTypeIf_MatchingId_ClearsAndReturnsTrue()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        settings.ChangeDefaultSellerType("TYPE0001");

        // Act
        var changed = settings.ClearDefaultSellerTypeIf("TYPE0001");

        // Assert
        Assert.True(changed);
        Assert.Null(settings.DefaultSellerTypeId);
    }

    [Fact]
    public void ClearDefaultSellerTypeIf_OtherId_KeepsDefaultAndReturnsFalse()
    {
        // Arrange
        var settings = SettingsAggregate.Create(3000);
        settings.ChangeDefaultSellerType("TYPE0001");

        // Act
        var changed = settings.ClearDefaultSellerTypeIf("TYPE0002");

        // Assert
        Assert.False(changed);
        Assert.Equal("TYPE0001", settings.DefaultSellerTypeId);
    }
}
