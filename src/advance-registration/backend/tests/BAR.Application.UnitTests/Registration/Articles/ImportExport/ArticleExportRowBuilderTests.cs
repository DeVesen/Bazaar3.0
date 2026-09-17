using BAR.Modules.Registration.Application.Articles.ImportExport;
using BAR.Modules.Registration.Domain.Articles;

namespace BAR.Application.UnitTests.Registration.Articles.ImportExport;

public class ArticleExportRowBuilderTests
{
    private static readonly DateTime Now = new(2026, 9, 17, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void BuildExportRows_NumberWithArticle_FillsAllFields()
    {
        var article = Article.Create("s1", 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", "kaum getragen", Now);

        var rows = ArticleExportRowBuilder.BuildExportRows([101], [article]);

        Assert.Equal(new ArticleExportRow(101, "Jacke", "Jacken", "Nike", "M", 25m), rows.Single());
    }

    [Fact]
    public void BuildExportRows_NumberWithoutArticle_OnlyNumberFilled()
    {
        var rows = ArticleExportRowBuilder.BuildExportRows([102], []);

        Assert.Equal(new ArticleExportRow(102, null, null, null, null, null), rows.Single());
    }

    [Fact]
    public void BuildTemplateRows_NeverIncludesArticleData()
    {
        var rows = ArticleExportRowBuilder.BuildTemplateRows([101, 102]);

        Assert.All(rows, r => Assert.Null(r.Name));
        Assert.Equal([101, 102], rows.Select(r => r.Number));
    }
}
