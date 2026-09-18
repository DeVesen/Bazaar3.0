using Bazaar.Domain.Articles;
using Bazaar.Domain.Sellers;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class ArticleListQueryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    private static Seller CreateSeller(string id, string firstName, string lastName, string? city = "Karlsruhe") =>
        Seller.Create(
            id, firstName, lastName, null, "76133", city, null,
            $"{id}@example.org", "SLT00001", 10m, 0.5m);

    private static Article CreateArticle(
        string id,
        int number,
        string sellerId,
        string name,
        string brand,
        string category,
        decimal price)
    {
        var now = DateTimeOffset.UtcNow;
        return Article.Create(id, number, sellerId, name, brand, category, price, null, null, null, now, now);
    }

    private static async Task SeedBasicCatalogAsync(BazaarDbContext dbContext)
    {
        var anna = CreateSeller("SEL00001", "Anna", "Meier");
        var max = CreateSeller("SEL00002", "Max", "Mustermann");
        await dbContext.Sellers.AddRangeAsync(anna, max);

        // Registered (default status: no timestamps set).
        var jacke = CreateArticle("ART00001", 1043, "SEL00001", "Winterjacke", "Nike", "Jacken", 12.00m);

        // Selling: released only.
        var hose = CreateArticle("ART00002", 2001, "SEL00002", "Hose", "Adidas", "Kleidung", 20m);
        hose.SetTimestamps(DateTimeOffset.UtcNow, null, null, false, DateTimeOffset.UtcNow);

        // Sold: released + sold.
        var schuhe = CreateArticle("ART00003", 3050, "SEL00001", "Schuhe", "Nike", "Schuhe", 40m);
        schuhe.SetTimestamps(DateTimeOffset.UtcNow, DateTimeOffset.UtcNow, null, false, DateTimeOffset.UtcNow);

        // Returned: released + returned.
        var muetze = CreateArticle("ART00004", 500, "SEL00002", "Mütze", "Puma", "Accessoires", 5m);
        muetze.SetTimestamps(DateTimeOffset.UtcNow, null, DateTimeOffset.UtcNow, false, DateTimeOffset.UtcNow);

        await dbContext.Articles.AddRangeAsync(jacke, hose, schuhe, muetze);
        await dbContext.SaveChangesAsync();
    }

    [Fact]
    public async Task GetArticles_DefaultSort_OrdersByNumberAscending()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles(null, null, null, null, null, 1, 50);

        Assert.Equal([500, 1043, 2001, 3050], page.Items.Select(i => i.Number));
    }

    [Theory]
    [InlineData("1043")] // number-as-string
    [InlineData("Winterjacke")] // name
    [InlineData("Nike")] // brand — matches jacke and schuhe, filtered further below by number
    [InlineData("Jacken")] // category
    [InlineData("Anna Meier")] // sellerName
    public async Task GetArticles_TextSearch_MatchesEachSearchField(string query)
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles(query, null, null, null, null, 1, 50);

        Assert.Contains(page.Items, i => i.Id == "ART00001");
    }

    [Fact]
    public async Task GetArticles_MultiTokenQuery_RequiresAllTokensToMatch()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        // "Nike" matches jacke + schuhe; "Winterjacke" narrows to jacke only (AND across tokens).
        var page = await sut.GetArticles("Nike Winterjacke", null, null, null, null, 1, 50);

        var item = Assert.Single(page.Items);
        Assert.Equal("ART00001", item.Id);
    }

    [Fact]
    public async Task GetArticles_MultiTokenQuery_NoArticleMatchesAllTokens_ReturnsEmpty()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles("Nike Hose", null, null, null, null, 1, 50);

        Assert.Empty(page.Items);
    }

    [Fact]
    public async Task GetArticles_BrandFilter_ExactMatchCaseInsensitive()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles(null, "nike", null, null, null, 1, 50);

        Assert.Equal(2, page.TotalCount);
        Assert.All(page.Items, i => Assert.Equal("Nike", i.Brand));
    }

    [Fact]
    public async Task GetArticles_CategoryFilter_ExactMatchCaseInsensitive()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles(null, null, "jacken", null, null, 1, 50);

        var item = Assert.Single(page.Items);
        Assert.Equal("ART00001", item.Id);
    }

    [Fact]
    public async Task GetArticles_StatusFilterRegistered_ReturnsOnlyRegisteredArticle()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles(null, null, null, "registered", null, 1, 50);

        var item = Assert.Single(page.Items);
        Assert.Equal("ART00001", item.Id);
        Assert.Equal("registered", item.Status);
    }

    [Fact]
    public async Task GetArticles_StatusFilterSold_ReturnsOnlySoldArticle()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles(null, null, null, "sold", null, 1, 50);

        var item = Assert.Single(page.Items);
        Assert.Equal("ART00003", item.Id);
        Assert.Equal("sold", item.Status);
    }

    [Fact]
    public async Task GetArticles_MultiFieldSort_RespectsBothKeys()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        // All four seeded articles have distinct categories, so add a second
        // article sharing a category with a different price to make the
        // secondary sort key observable.
        var extra = CreateArticle("ART00005", 999, "SEL00001", "Jacke 2", "Reebok", "Jacken", 5m);
        await dbContext.Articles.AddAsync(extra, cancellationToken);
        await dbContext.SaveChangesAsync(cancellationToken);

        var page = await sut.GetArticles(null, null, null, null, "category:asc,price:desc", 1, 50);

        var jackenItems = page.Items.Where(i => i.Category == "Jacken").ToList();
        Assert.Equal(2, jackenItems.Count);
        // price desc within the "Jacken" category group.
        Assert.Equal(["ART00001", "ART00005"], jackenItems.Select(i => i.Id));

        // category asc means "Accessoires" (Mütze) sorts before "Jacken".
        Assert.Equal("Accessoires", page.Items.First().Category);
    }

    [Fact]
    public async Task GetArticles_UnrecognizedSortField_IsNoOpForThatKey()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles(null, null, null, null, "unknownField:asc,number:asc", 1, 50);

        Assert.Equal([500, 1043, 2001, 3050], page.Items.Select(i => i.Number));
    }

    [Fact]
    public async Task GetArticles_Pagination_ReturnsRequestedPage()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page1 = await sut.GetArticles(null, null, null, null, null, 1, 2);
        var page2 = await sut.GetArticles(null, null, null, null, null, 2, 2);

        Assert.Equal(4, page1.TotalCount);
        Assert.Equal(2, page1.Items.Count);
        Assert.Equal(2, page2.Items.Count);
        Assert.Equal([500, 1043], page1.Items.Select(i => i.Number));
        Assert.Equal([2001, 3050], page2.Items.Select(i => i.Number));
    }

    [Fact]
    public async Task GetArticles_PageSizeAboveCap_IsClampedTo200()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles(null, null, null, null, null, 1, 100_000);

        Assert.Equal(200, page.PageSize);
    }

    [Fact]
    public async Task GetArticles_SellerNameIsJoinedFromSeller()
    {
        await using var dbContext = CreateContext();
        await SeedBasicCatalogAsync(dbContext);
        var sut = new ArticleListQuery(dbContext);

        var page = await sut.GetArticles(null, null, null, null, null, 1, 50);

        var item = page.Items.Single(i => i.Id == "ART00001");
        Assert.Equal("SEL00001", item.SellerId);
        Assert.Equal("Anna Meier", item.SellerName);
    }
}
