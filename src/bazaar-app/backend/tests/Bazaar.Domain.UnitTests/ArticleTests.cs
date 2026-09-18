using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;

namespace Bazaar.Domain.UnitTests;

public class ArticleTests
{
    private static readonly DateTimeOffset CreatedAt = new(2026, 9, 1, 10, 0, 0, TimeSpan.Zero);
    private static readonly DateTimeOffset UpdatedAt = new(2026, 9, 1, 10, 0, 0, TimeSpan.Zero);

    private static Article CreateValidArticle() =>
        Article.Create(
            "article-1",
            1,
            "seller-1",
            "T-Shirt",
            "Acme",
            "Kleidung",
            9.99m,
            "M",
            "Blau",
            "Kaum getragen",
            CreatedAt,
            UpdatedAt);

    [Fact]
    public void Create_WithValidData_SetsAllFieldsAndDefaultsSoldManuallyToFalse()
    {
        var article = CreateValidArticle();

        Assert.Equal("article-1", article.Id);
        Assert.Equal(1, article.Number);
        Assert.Equal("seller-1", article.SellerId);
        Assert.Equal("T-Shirt", article.Name);
        Assert.Equal("Acme", article.Brand);
        Assert.Equal("Kleidung", article.Category);
        Assert.Equal(9.99m, article.Price);
        Assert.Equal("M", article.Size);
        Assert.Equal("Blau", article.Color);
        Assert.Equal("Kaum getragen", article.Description);
        Assert.Equal(CreatedAt, article.CreatedAt);
        Assert.Equal(UpdatedAt, article.UpdatedAt);
        Assert.False(article.SoldManually);
        Assert.Null(article.AcceptedAt);
        Assert.Null(article.ReleasedAt);
        Assert.Null(article.SoldAt);
        Assert.Null(article.ReturnedAt);
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceName_Throws(string name)
    {
        Assert.Throws<ArgumentException>(() =>
            Article.Create("article-1", 1, "seller-1", name, "Acme", "Kleidung", 9.99m, null, null, null, CreatedAt, UpdatedAt));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceBrand_Throws(string brand)
    {
        Assert.Throws<ArgumentException>(() =>
            Article.Create("article-1", 1, "seller-1", "T-Shirt", brand, "Kleidung", 9.99m, null, null, null, CreatedAt, UpdatedAt));
    }

    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceCategory_Throws(string category)
    {
        Assert.Throws<ArgumentException>(() =>
            Article.Create("article-1", 1, "seller-1", "T-Shirt", "Acme", category, 9.99m, null, null, null, CreatedAt, UpdatedAt));
    }

    [Fact]
    public void Status_IsRegistered_WhenReleasedAtIsNull()
    {
        var article = CreateValidArticle();

        Assert.Equal(ArticleStatus.Registered, article.Status);
    }

    [Fact]
    public void Status_IsSelling_WhenReleasedAtSetAndSoldAtAndReturnedAtNull()
    {
        var article = CreateValidArticle();

        article.SetTimestamps(UpdatedAt, null, null, false, UpdatedAt);

        Assert.Equal(ArticleStatus.Selling, article.Status);
    }

    [Fact]
    public void Status_IsSold_WhenSoldAtSet()
    {
        var article = CreateValidArticle();

        article.SetTimestamps(UpdatedAt, UpdatedAt, null, false, UpdatedAt);

        Assert.Equal(ArticleStatus.Sold, article.Status);
    }

    [Fact]
    public void Status_IsReturned_WhenReturnedAtSet()
    {
        var article = CreateValidArticle();

        article.SetTimestamps(UpdatedAt, null, UpdatedAt, false, UpdatedAt);

        Assert.Equal(ArticleStatus.Returned, article.Status);
    }

    [Fact]
    public void UpdateDetails_WhenSoldAndPriceChanges_ThrowsConflictExceptionWithArticleSoldErrorCode()
    {
        var article = CreateValidArticle();
        article.SetTimestamps(UpdatedAt, UpdatedAt, null, false, UpdatedAt);

        var exception = Assert.Throws<ConflictException>(() =>
            article.UpdateDetails("T-Shirt", "Acme", "Kleidung", 12.99m, "M", "Blau", "Kaum getragen", UpdatedAt));

        Assert.Equal("article.sold", exception.ErrorCode);
    }

    [Fact]
    public void UpdateDetails_WhenSoldAndPriceUnchanged_Succeeds()
    {
        var article = CreateValidArticle();
        article.SetTimestamps(UpdatedAt, UpdatedAt, null, false, UpdatedAt);

        article.UpdateDetails("Neuer Name", "Acme", "Kleidung", 9.99m, "L", "Rot", "Neu", UpdatedAt);

        Assert.Equal("Neuer Name", article.Name);
        Assert.Equal("L", article.Size);
        Assert.Equal("Rot", article.Color);
        Assert.Equal("Neu", article.Description);
        Assert.Equal(9.99m, article.Price);
    }

    [Fact]
    public void UpdateDetails_WhenNotSold_UpdatesAllFieldsFreely()
    {
        var article = CreateValidArticle();
        var now = new DateTimeOffset(2026, 9, 2, 12, 0, 0, TimeSpan.Zero);

        article.UpdateDetails("Neuer Name", "NeueMarke", "NeueKategorie", 19.99m, "XL", "Grün", "Neue Beschreibung", now);

        Assert.Equal("Neuer Name", article.Name);
        Assert.Equal("NeueMarke", article.Brand);
        Assert.Equal("NeueKategorie", article.Category);
        Assert.Equal(19.99m, article.Price);
        Assert.Equal("XL", article.Size);
        Assert.Equal("Grün", article.Color);
        Assert.Equal("Neue Beschreibung", article.Description);
        Assert.Equal(now, article.UpdatedAt);
    }

    [Fact]
    public void SetTimestamps_WhenSoldAtAndReturnedAtBothSet_ThrowsSoldAndReturnedConflict()
    {
        var article = CreateValidArticle();

        var exception = Assert.Throws<ConflictException>(() =>
            article.SetTimestamps(UpdatedAt, UpdatedAt, UpdatedAt, false, UpdatedAt));

        Assert.Equal("article.sold_and_returned", exception.ErrorCode);
    }

    [Fact]
    public void SetTimestamps_WhenSoldAtSetButReleasedAtNull_ThrowsCascadeInvalid()
    {
        var article = CreateValidArticle();

        var exception = Assert.Throws<ConflictException>(() =>
            article.SetTimestamps(null, UpdatedAt, null, false, UpdatedAt));

        Assert.Equal("article.timestamp_cascade_invalid", exception.ErrorCode);
    }

    [Fact]
    public void SetTimestamps_WhenReturnedAtSetButReleasedAtNull_ThrowsCascadeInvalid()
    {
        var article = CreateValidArticle();

        var exception = Assert.Throws<ConflictException>(() =>
            article.SetTimestamps(null, null, UpdatedAt, false, UpdatedAt));

        Assert.Equal("article.timestamp_cascade_invalid", exception.ErrorCode);
    }

    [Fact]
    public void SetTimestamps_WithValidCombination_FullyReplacesAllThreeTimestamps()
    {
        var article = CreateValidArticle();
        var releasedAt = new DateTimeOffset(2026, 9, 2, 8, 0, 0, TimeSpan.Zero);
        var soldAt = new DateTimeOffset(2026, 9, 3, 8, 0, 0, TimeSpan.Zero);
        var now = new DateTimeOffset(2026, 9, 3, 9, 0, 0, TimeSpan.Zero);

        article.SetTimestamps(releasedAt, soldAt, null, true, now);

        Assert.Equal(releasedAt, article.ReleasedAt);
        Assert.Equal(soldAt, article.SoldAt);
        Assert.Null(article.ReturnedAt);
        Assert.Equal(now, article.UpdatedAt);

        // Full replace: clearing a previously-set timestamp back to null.
        var laterNow = new DateTimeOffset(2026, 9, 4, 9, 0, 0, TimeSpan.Zero);
        article.SetTimestamps(releasedAt, null, null, false, laterNow);

        Assert.Equal(releasedAt, article.ReleasedAt);
        Assert.Null(article.SoldAt);
        Assert.Null(article.ReturnedAt);
        Assert.Equal(laterNow, article.UpdatedAt);
    }

    [Theory]
    [InlineData(true)]
    [InlineData(false)]
    public void SetTimestamps_SetsSoldManuallyToPassedInValue(bool manually)
    {
        var article = CreateValidArticle();

        article.SetTimestamps(UpdatedAt, null, null, manually, UpdatedAt);

        Assert.Equal(manually, article.SoldManually);
    }
}
