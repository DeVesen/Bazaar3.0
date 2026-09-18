using Bazaar.Domain.Articles;
using Bazaar.Infrastructure.Persistence;
using Bazaar.Infrastructure.Persistence.Repositories;
using Microsoft.EntityFrameworkCore;

namespace Bazaar.Infrastructure.UnitTests.Persistence.Repositories;

public class ArticleRepositoryTests
{
    private static BazaarDbContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<BazaarDbContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new BazaarDbContext(options);
    }

    private static Article CreateArticle(
        string id = "ART00001",
        int number = 1,
        string sellerId = "SEL00001",
        string name = "T-Shirt",
        string brand = "Nike",
        string category = "Kleidung",
        decimal price = 10m)
    {
        var now = DateTimeOffset.UtcNow;
        return Article.Create(id, number, sellerId, name, brand, category, price, null, null, null, now, now);
    }

    [Fact]
    public async Task Add_PersistsArticle_FindableByGetById()
    {
        await using var dbContext = CreateContext();
        var sut = new ArticleRepository(dbContext);
        var article = CreateArticle();

        await sut.Add(article);

        var found = await sut.GetById("ART00001");
        Assert.NotNull(found);
        Assert.Equal("T-Shirt", found!.Name);
        Assert.Equal("Nike", found.Brand);
    }

    [Fact]
    public async Task GetById_UnknownId_ReturnsNull()
    {
        await using var dbContext = CreateContext();
        var sut = new ArticleRepository(dbContext);

        var found = await sut.GetById("UNKNOWN1");

        Assert.Null(found);
    }

    [Fact]
    public async Task Update_PersistsChanges()
    {
        await using var dbContext = CreateContext();
        var sut = new ArticleRepository(dbContext);
        var article = CreateArticle();
        await sut.Add(article);

        article.UpdateDetails("Hose", "Adidas", "Kleidung", 20m, null, null, null, DateTimeOffset.UtcNow);
        await sut.Update(article);

        var found = await sut.GetById("ART00001");
        Assert.NotNull(found);
        Assert.Equal("Hose", found!.Name);
        Assert.Equal("Adidas", found.Brand);
        Assert.Equal(20m, found.Price);
    }

    [Fact]
    public async Task Remove_DeletesArticle()
    {
        await using var dbContext = CreateContext();
        var sut = new ArticleRepository(dbContext);
        var article = CreateArticle();
        await sut.Add(article);

        await sut.Remove(article);

        Assert.Null(await sut.GetById("ART00001"));
    }

    [Fact]
    public async Task GetAllBySellerId_ReturnsOnlyMatchingSellerArticles()
    {
        await using var dbContext = CreateContext();
        var sut = new ArticleRepository(dbContext);
        await sut.Add(CreateArticle("ART00001", 1, "SEL00001"));
        await sut.Add(CreateArticle("ART00002", 2, "SEL00001"));
        await sut.Add(CreateArticle("ART00003", 3, "SEL00002"));

        var result = await sut.GetAllBySellerId("SEL00001");

        Assert.Equal(2, result.Count);
        Assert.All(result, a => Assert.Equal("SEL00001", a.SellerId));
    }

    [Fact]
    public async Task GetAllBySellerId_UnknownSeller_ReturnsEmpty()
    {
        await using var dbContext = CreateContext();
        var sut = new ArticleRepository(dbContext);
        await sut.Add(CreateArticle());

        var result = await sut.GetAllBySellerId("UNKNOWN1");

        Assert.Empty(result);
    }
}
