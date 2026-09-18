using Bazaar.Domain.Categories;

namespace Bazaar.Domain.UnitTests;

public class CategoryTests
{
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceId_Throws(string id)
    {
        Assert.Throws<ArgumentException>(() =>
            Category.Create(id, "Acme", original: false));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceName_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() =>
            Category.Create("category-1", name, original: false));
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void Create_WithValidData_SetsAllPropertiesAndTrimsName(bool original)
    {
        var category = Category.Create("category-1", "  Acme  ", original);

        Assert.Equal("category-1", category.Id);
        Assert.Equal("Acme", category.Name);
        Assert.Equal(original, category.Original);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Rename_WithEmptyOrWhitespaceName_Throws(string name)
    {
        var category = Category.Create("category-1", "Acme", original: false);

        Assert.Throws<ArgumentException>(() => category.Rename(name));
    }

    [Fact]
    public void Rename_WithValidName_UpdatesNameAndTrims()
    {
        var category = Category.Create("category-1", "Acme", original: false);

        category.Rename("  Acme Deluxe  ");

        Assert.Equal("Acme Deluxe", category.Name);
    }

    [Fact]
    public void SetOriginal_TogglesOriginal()
    {
        var category = Category.Create("category-1", "Acme", original: false);

        category.SetOriginal(true);
        Assert.True(category.Original);

        category.SetOriginal(false);
        Assert.False(category.Original);
    }
}
