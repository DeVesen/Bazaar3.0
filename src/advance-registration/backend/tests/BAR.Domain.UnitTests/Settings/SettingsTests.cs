using DomainSettings = BAR.Domain.Settings.Settings;

namespace BAR.Domain.UnitTests.Settings;

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
    public void Create_InfoTextOverLimit_Throws()
    {
        var now = DateTime.UtcNow;
        var tooLong = new string('a', 4001);

        Assert.Throws<ArgumentException>(() => DomainSettings.Create(now, now, now, now, now, "t1b2c3d4", tooLong, 1, 10, 1));
    }
}
