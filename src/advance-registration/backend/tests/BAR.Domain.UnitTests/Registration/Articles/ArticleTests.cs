using BAR.Modules.Registration.Domain.Articles;

namespace BAR.Domain.UnitTests.Registration.Articles;

public class ArticleTests
{
    private static readonly DateTime Now = new(2026, 8, 14, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void Create_ValidData_SetsAllFields()
    {
        var article = Article.Create("s1234567", 104, "Winterjacke", "Jako-O", "Jacken", 12.50m, "116", "rot", "kaum getragen", Now);

        Assert.Equal(8, article.Id.Length);
        Assert.Equal(104, article.Number);
        Assert.Equal("s1234567", article.SellerId);
        Assert.Equal("Winterjacke", article.Name);
        Assert.Equal("Jako-O", article.Brand);
        Assert.Equal("Jacken", article.Category);
        Assert.Equal(12.50m, article.Price);
        Assert.Equal("116", article.Size);
        Assert.Equal("rot", article.Color);
        Assert.Equal("kaum getragen", article.Description);
        Assert.Equal(Now, article.CreatedAt);
        Assert.Equal(Now, article.UpdatedAt);
    }

    [Fact]
    public void Create_NoOptionalFields_LeavesThemNull()
    {
        var article = Article.Create("s1234567", 104, "Winterjacke", "Jako-O", "Jacken", 12.50m, null, null, null, Now);

        Assert.Null(article.Size);
        Assert.Null(article.Color);
        Assert.Null(article.Description);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_NameMissing_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() =>
            Article.Create("s1234567", 104, name, "Jako-O", "Jacken", 12.50m, null, null, null, Now));
    }

    [Fact]
    public void Create_PriceNotPositive_Throws()
    {
        Assert.Throws<ArgumentException>(() =>
            Article.Create("s1234567", 104, "Winterjacke", "Jako-O", "Jacken", 0m, null, null, null, Now));
    }

    [Fact]
    public void Update_ChangesFieldsAndBumpsUpdatedAt()
    {
        var article = Article.Create("s1234567", 104, "Winterjacke", "Jako-O", "Jacken", 12.50m, null, null, null, Now);
        var later = Now.AddDays(1);

        article.Update("Sommerjacke", "H&M", "Jacken", 9.00m, "104", "blau", "neu", later);

        Assert.Equal("Sommerjacke", article.Name);
        Assert.Equal("H&M", article.Brand);
        Assert.Equal(9.00m, article.Price);
        Assert.Equal("104", article.Size);
        Assert.Equal("blau", article.Color);
        Assert.Equal("neu", article.Description);
        Assert.Equal(later, article.UpdatedAt);
        Assert.Equal(Now, article.CreatedAt);
        Assert.Equal(104, article.Number);
    }
}
