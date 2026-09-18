using Bazaar.Domain.Brands;

namespace Bazaar.Domain.UnitTests;

public class BrandTests
{
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceId_Throws(string id)
    {
        Assert.Throws<ArgumentException>(() =>
            Brand.Create(id, "Acme", original: false));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceName_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() =>
            Brand.Create("brand-1", name, original: false));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Create_WithValidData_SetsAllPropertiesAndTrimsName(bool original)
    {
        var brand = Brand.Create("brand-1", "  Acme  ", original);

        Assert.Equal("brand-1", brand.Id);
        Assert.Equal("Acme", brand.Name);
        Assert.Equal(original, brand.Original);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Rename_WithEmptyOrWhitespaceName_Throws(string name)
    {
        var brand = Brand.Create("brand-1", "Acme", original: false);

        Assert.Throws<ArgumentException>(() => brand.Rename(name));
    }

    [Fact]
    public void Rename_WithValidName_UpdatesNameAndTrims()
    {
        var brand = Brand.Create("brand-1", "Acme", original: false);

        brand.Rename("  Acme Deluxe  ");

        Assert.Equal("Acme Deluxe", brand.Name);
    }

    [Fact]
    public void SetOriginal_TogglesOriginal()
    {
        var brand = Brand.Create("brand-1", "Acme", original: false);

        brand.SetOriginal(true);
        Assert.True(brand.Original);

        brand.SetOriginal(false);
        Assert.False(brand.Original);
    }
}
