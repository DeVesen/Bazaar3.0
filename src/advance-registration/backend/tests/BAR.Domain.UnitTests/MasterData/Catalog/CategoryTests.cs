using BAR.Modules.MasterData.Domain.Catalog;

namespace BAR.Domain.UnitTests.MasterData.MasterData;

public class CategoryTests
{
    [Fact]
    public void Create_ValidName_SetsFields()
    {
        var category = Category.Create("Jacken", original: true);

        Assert.Equal(8, category.Id.Length);
        Assert.Equal("Jacken", category.Name);
        Assert.True(category.Original);
    }

    [Theory]
    [InlineData("")]
    [InlineData("  ")]
    public void Create_NameMissing_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() => Category.Create(name, original: false));
    }

    [Fact]
    public void Rename_ChangesNameAndOriginal()
    {
        var category = Category.Create("Jacken", original: false);

        category.Rename("Mäntel", original: true);

        Assert.Equal("Mäntel", category.Name);
        Assert.True(category.Original);
    }
}
