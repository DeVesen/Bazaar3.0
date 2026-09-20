using System.Text;
using Bazaar.Application.Import;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Bazaar.Domain.SellerTypes;
using Moq;

namespace Bazaar.Application.UnitTests.Import;

public class PreviewImportHandlerTests
{
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<IBrandRepository> _brandRepository = new();
    private readonly Mock<ICategoryRepository> _categoryRepository = new();
    private readonly Mock<ISellerTypeRepository> _sellerTypeRepository = new();

    public PreviewImportHandlerTests()
    {
        _sellerRepository.Setup(r => r.GetById(It.IsAny<string>())).ReturnsAsync((Seller?)null);
        _articleRepository.Setup(r => r.GetAllBySellerId(It.IsAny<string>())).ReturnsAsync(Array.Empty<Article>());
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase(It.IsAny<string>())).ReturnsAsync(false);
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase(It.IsAny<string>())).ReturnsAsync(false);
        _sellerTypeRepository.Setup(r => r.GetAll()).ReturnsAsync(Array.Empty<SellerType>());
    }

    private PreviewImportHandler CreateSut() => new(
        _sellerRepository.Object,
        _articleRepository.Object,
        _brandRepository.Object,
        _categoryRepository.Object,
        _sellerTypeRepository.Object);

    private static Stream ToStream(string json) => new MemoryStream(Encoding.UTF8.GetBytes(json));

    private static string JsonWithSellers(string sellersJson, string brandsJson = "[]", string categoriesJson = "[]") =>
        $$"""
        {
          "exportedAt": "2026-06-14T08:00:00Z",
          "sellers": [{{sellersJson}}],
          "brands": {{brandsJson}},
          "categories": {{categoriesJson}}
        }
        """;

    private static string SellerJson(
        string id = "SELLER001",
        string firstName = "Anna",
        string lastName = "Meier",
        string sellerType = "Privat",
        string articlesJson = "") =>
        $$"""
        {
          "id": "{{id}}",
          "firstName": "{{firstName}}",
          "lastName": "{{lastName}}",
          "email": "anna@example.org",
          "sellerType": "{{sellerType}}",
          "articles": [{{articlesJson}}]
        }
        """;

    private static string ArticleJson(string id = "ARTICLE001", int number = 1) =>
        $$"""
        {
          "id": "{{id}}",
          "number": {{number}},
          "name": "Winterjacke",
          "brand": "Nike",
          "category": "Jacken",
          "price": 12.00
        }
        """;

    private static Seller ExistingSeller(string id = "SELLER001") =>
        Seller.Create(id, "Anna", "Meier", null, null, null, null, "anna@example.org", "SELLERTYPE001", 10m, 3m);

    private static Article SoldArticle(string sellerId = "SELLER001")
    {
        var now = DateTimeOffset.UtcNow;
        var article = Article.Create("ARTICLE999", 999, sellerId, "Verkauft", "Nike", "Jacken", 5m, null, null, null, now, now);
        article.SetTimestamps(releasedAt: now, soldAt: now, returnedAt: null, manually: false, now: now);
        return article;
    }

    [Fact]
    public async Task Handle_SchemaInvalidFile_PropagatesBadRequestExceptionWithInvalidFormatCode()
    {
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<BadRequestException>(
            () => sut.Handle(ToStream("{ not valid json"), TestContext.Current.CancellationToken));

        Assert.Equal("import.invalid_format", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_EmptySellersArray_ReturnsAllZeroCounts()
    {
        var json = """
            {
              "exportedAt": "2026-06-14T08:00:00Z",
              "sellers": [],
              "brands": [],
              "categories": []
            }
            """;
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.SellerCount);
        Assert.Equal(0, result.ArticleCount);
        Assert.Equal(0, result.NewSellers);
        Assert.Equal(0, result.ReplacedSellers);
        Assert.Empty(result.SkippedSellers);
    }

    [Fact]
    public async Task Handle_SellerIdNotInRepository_CountsAsNewSeller()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001"));
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.NewSellers);
        Assert.Equal(0, result.ReplacedSellers);
        Assert.Empty(result.SkippedSellers);
    }

    [Fact]
    public async Task Handle_SellerExistsNotSoldNotSettled_CountsAsReplacedSeller()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001"));
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(ExistingSeller("SELLER001"));
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync(Array.Empty<Article>());
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.NewSellers);
        Assert.Equal(1, result.ReplacedSellers);
        Assert.Empty(result.SkippedSellers);
    }

    [Fact]
    public async Task Handle_SellerExistsWithSoldArticles_IsSkippedWithHasSoldArticlesReason()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001"));
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(ExistingSeller("SELLER001"));
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync([SoldArticle("SELLER001")]);
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.ReplacedSellers);
        var skipped = Assert.Single(result.SkippedSellers);
        Assert.Equal("SELLER001", skipped.Id);
        Assert.Equal("Anna Meier", skipped.Name);
        Assert.Equal("has_sold_articles", skipped.Reason);
        Assert.Equal(1, skipped.SoldCount);
    }

    [Fact]
    public async Task Handle_SellerExistsSettledButNoSoldArticles_IsSkipped()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001"));
        var settledSeller = ExistingSeller("SELLER001");
        settledSeller.Settle(100m, DateTimeOffset.UtcNow);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(settledSeller);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync(Array.Empty<Article>());
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), TestContext.Current.CancellationToken);

        Assert.Equal(0, result.ReplacedSellers);
        var skipped = Assert.Single(result.SkippedSellers);
        Assert.Equal("settled", skipped.Reason);
    }

    [Fact]
    public async Task Handle_UnknownSellerType_ReportedWithAffectedSellersCount()
    {
        var json = JsonWithSellers(
            SellerJson(id: "SELLER001", sellerType: "Verein") + "," +
            SellerJson(id: "SELLER002", sellerType: "Verein"));
        _sellerTypeRepository.Setup(r => r.GetAll()).ReturnsAsync([SellerType.Create("TYPE001", "Privat", 10m, 1m)]);
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), TestContext.Current.CancellationToken);

        var unknown = Assert.Single(result.UnknownSellerTypes);
        Assert.Equal("Verein", unknown.Name);
        Assert.Equal(2, unknown.AffectedSellers);
    }

    [Fact]
    public async Task Handle_SellerTypeMatchesCaseInsensitively_NotReportedAsUnknown()
    {
        var json = JsonWithSellers(SellerJson(id: "SELLER001", sellerType: "privat"));
        _sellerTypeRepository.Setup(r => r.GetAll()).ReturnsAsync([SellerType.Create("TYPE001", "Privat", 10m, 1m)]);
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), TestContext.Current.CancellationToken);

        Assert.Empty(result.UnknownSellerTypes);
    }

    [Fact]
    public async Task Handle_BrandsAndCategories_OnlyCountsNewNamesCaseInsensitively()
    {
        var json = JsonWithSellers(
            SellerJson(id: "SELLER001"),
            brandsJson: """["Nike", "Puma"]""",
            categoriesJson: """["Jacken", "Hosen"]""");
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase("Nike")).ReturnsAsync(true); // existing, different case tolerated by repo contract
        _brandRepository.Setup(r => r.ExistsByNameIgnoreCase("Puma")).ReturnsAsync(false);
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase("Jacken")).ReturnsAsync(true);
        _categoryRepository.Setup(r => r.ExistsByNameIgnoreCase("Hosen")).ReturnsAsync(false);
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), TestContext.Current.CancellationToken);

        Assert.Equal(1, result.NewBrands);
        Assert.Equal(1, result.NewCategories);
    }

    [Fact]
    public async Task Handle_SellerCountAndArticleCount_MatchFileContents()
    {
        var json = JsonWithSellers(
            SellerJson(id: "SELLER001", articlesJson: ArticleJson("ARTICLE001", 1) + "," + ArticleJson("ARTICLE002", 2)) + "," +
            SellerJson(id: "SELLER002", articlesJson: ArticleJson("ARTICLE003", 3)));
        var sut = CreateSut();

        var result = await sut.Handle(ToStream(json), TestContext.Current.CancellationToken);

        Assert.Equal(2, result.SellerCount);
        Assert.Equal(3, result.ArticleCount);
    }
}
