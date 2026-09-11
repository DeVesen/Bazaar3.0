using BAR.Modules.Stammdaten.Domain.MasterData;

namespace BAR.Domain.UnitTests.Stammdaten.MasterData;

public class BrandTests
{
    [Fact]
    public void Create_ValidName_SetsFields()
    {
        var brand = Brand.Create("Jako-O", original: true);

        Assert.Equal(8, brand.Id.Length);
        Assert.Equal("Jako-O", brand.Name);
        Assert.True(brand.Original);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Create_NameMissing_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() => Brand.Create(name, original: false));
    }

    [Fact]
    public void Rename_ChangesNameAndOriginal()
    {
        var brand = Brand.Create("Nike", original: false);

        brand.Rename("Nike ", original: true);

        Assert.Equal("Nike ", brand.Name);
        Assert.True(brand.Original);
    }
}
