using DomainSettings = BAR.Modules.Operations.Domain.Settings;

namespace BAR.Domain.UnitTests.Operations;

public class SettingsTests
{
    [Fact]
    public void Create_ValidData_UsesFixedId()
    {
        var now = DateTime.UtcNow;
        var settings = DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", "Hinweis", 1, 10, 1);

        Assert.Equal("settings", settings.Id);
        Assert.Equal(1, settings.StartNumber);
        Assert.Equal(10, settings.BlockSize);
        Assert.Equal(1, settings.DefaultBlockCount);
    }

    [Fact]
    public void Create_AllNullable_AllowsAllNull()
    {
        var settings = DomainSettings.Create(null, null, null, null, null, null, null, 1, 10, 1);

        Assert.Null(settings.RegistrationDeadline);
        Assert.Null(settings.DefaultTypeId);
        Assert.Null(settings.InfoText);
    }

    [Fact]
    public void Create_InfoTextOverLimit_Throws()
    {
        var now = DateTime.UtcNow;
        var tooLong = new string('a', 4001);

        Assert.Throws<ArgumentException>(() => DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", tooLong, 1, 10, 1));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-1)]
    public void Create_NonPositiveStartNumber_Throws(int startNumber)
    {
        Assert.Throws<ArgumentException>(() => DomainSettings.Create(null, null, null, null, null, null, null, startNumber, 10, 1));
    }

    [Fact]
    public void Create_DescendingDates_Throws()
    {
        var now = DateTime.UtcNow;
        var earlier = now.AddDays(-1);

        Assert.Throws<ArgumentException>(() => DomainSettings.Create(now, earlier, now, now, now, null, null, 1, 10, 1));
    }

    [Fact]
    public void Create_PartialDatesSkippingNulls_DoesNotThrow()
    {
        var now = DateTime.UtcNow;

        var settings = DomainSettings.Create(now, null, null, now.AddDays(1), null, null, null, 1, 10, 1);

        Assert.Equal(now, settings.RegistrationDeadline);
        Assert.Equal(now.AddDays(1), settings.BazaarFrom);
    }

    [Fact]
    public void Update_ValidData_ChangesValues()
    {
        var now = DateTime.UtcNow;
        var settings = DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", "Alt", 1, 10, 1);

        settings.Update(now, now, now, now, now, "t9999999", "Neu", 2, 20, 3);

        Assert.Equal("t9999999", settings.DefaultTypeId);
        Assert.Equal("Neu", settings.InfoText);
        Assert.Equal(2, settings.StartNumber);
        Assert.Equal(20, settings.BlockSize);
        Assert.Equal(3, settings.DefaultBlockCount);
    }

    [Fact]
    public void Update_DescendingDates_ThrowsAndLeavesValuesUnchanged()
    {
        var now = DateTime.UtcNow;
        var settings = DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", "Alt", 1, 10, 1);

        Assert.Throws<ArgumentException>(() => settings.Update(now, now.AddDays(-1), now, now, now, "t1b2c3d4", "Alt", 1, 10, 1));
        Assert.Equal(now, settings.DropOffFrom);
    }
}
