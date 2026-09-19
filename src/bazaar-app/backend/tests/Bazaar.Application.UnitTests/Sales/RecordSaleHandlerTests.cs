using Bazaar.Application.Sales;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Sales;

public class RecordSaleHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public RecordSaleHandlerTests()
    {
        // The real EfUnitOfWork opens a transaction and invokes the action —
        // here we just invoke the action directly so handler logic (including
        // any exception it throws) runs exactly as it would inside the
        // transaction, without a real database.
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private RecordSaleHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object, _unitOfWork.Object);

    private static Seller CreateSeller(string id = "SELLER001") =>
        Seller.Create(id, "Anna", "Meier", null, null, null, null, "anna@example.org", "SELLERTYPE001", 10m, 3.00m);

    private static Article CreateArticle(string id, int number, decimal price = 12.00m, string sellerId = "SELLER001") =>
        Article.Create(
            id, number, sellerId, "Winterjacke", "Nike", "Jacken", price,
            "128", "rot", null, DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddDays(-1));

    private static Article CreateSellingArticle(string id, int number, decimal price = 12.00m, string sellerId = "SELLER001")
    {
        var article = CreateArticle(id, number, price, sellerId);
        article.MarkReleased(DateTimeOffset.UtcNow);
        return article;
    }

    private static Article CreateSoldArticle(string id, int number, string sellerId = "SELLER001")
    {
        var article = CreateSellingArticle(id, number, sellerId: sellerId);
        article.RecordSale(DateTimeOffset.UtcNow);
        return article;
    }

    private static Article CreateReturnedArticle(string id, int number, string sellerId = "SELLER001")
    {
        var article = CreateSellingArticle(id, number, sellerId: sellerId);
        article.SetTimestamps(article.ReleasedAt, null, DateTimeOffset.UtcNow, false, DateTimeOffset.UtcNow);
        return article;
    }

    [Fact]
    public async Task Handle_AllArticlesSelling_SellerNotSettled_SellsAllAndReturnsResult()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var article1 = CreateSellingArticle("ARTICLE001", 1043, price: 10.00m);
        var article2 = CreateSellingArticle("ARTICLE002", 1044, price: 15.00m);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article1);
        _articleRepository.Setup(r => r.GetById("ARTICLE002")).ReturnsAsync(article2);
        var command = new RecordSaleCommand { ArticleIds = ["ARTICLE001", "ARTICLE002"] };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(2, result.SoldCount);
        Assert.Equal(25.00m, result.Total);
        Assert.NotNull(article1.SoldAt);
        Assert.NotNull(article2.SoldAt);
        Assert.Equal(result.SoldAt, article1.SoldAt);
        Assert.Equal(result.SoldAt, article2.SoldAt);
        _articleRepository.Verify(r => r.Update(article1), Times.Once);
        _articleRepository.Verify(r => r.Update(article2), Times.Once);
    }

    [Fact]
    public async Task Handle_ArticleStillRegistered_ThrowsConflictWithArticleNumber_AndMakesNoWrites()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var registered = CreateArticle("ARTICLE001", 1044);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(registered);
        var command = new RecordSaleCommand { ArticleIds = ["ARTICLE001"] };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.not_sellable", exception.ErrorCode);
        var articleNumbers = Assert.IsAssignableFrom<List<int>>(exception.Extensions["articleNumbers"]);
        Assert.Equal([1044], articleNumbers);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ArticleAlreadySold_ThrowsConflictWithArticleNumber_AndMakesNoWrites()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var sold = CreateSoldArticle("ARTICLE001", 1044);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(sold);
        var command = new RecordSaleCommand { ArticleIds = ["ARTICLE001"] };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.not_sellable", exception.ErrorCode);
        var articleNumbers = Assert.IsAssignableFrom<List<int>>(exception.Extensions["articleNumbers"]);
        Assert.Equal([1044], articleNumbers);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_ArticleReturned_ThrowsConflictWithArticleNumber_AndMakesNoWrites()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var returned = CreateReturnedArticle("ARTICLE001", 1044);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(returned);
        var command = new RecordSaleCommand { ArticleIds = ["ARTICLE001"] };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.not_sellable", exception.ErrorCode);
        var articleNumbers = Assert.IsAssignableFrom<List<int>>(exception.Extensions["articleNumbers"]);
        Assert.Equal([1044], articleNumbers);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_UnresolvedArticleId_ThrowsConflict_AndMakesNoWrites()
    {
        _articleRepository.Setup(r => r.GetById("ARTICLE999")).ReturnsAsync((Article?)null);
        var command = new RecordSaleCommand { ArticleIds = ["ARTICLE999"] };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.not_sellable", exception.ErrorCode);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    /// <summary>
    /// The settlement safeguard: only reachable via direct repository
    /// manipulation in the test, since the UI never lets a cart reach
    /// checkout for an already-settled seller.
    /// </summary>
    [Fact]
    public async Task Handle_ArticleSellingButSellerAlreadySettled_ThrowsConflict_AndMakesNoWrites()
    {
        var seller = CreateSeller();
        seller.Settle(42.00m, DateTimeOffset.UtcNow);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var article = CreateSellingArticle("ARTICLE001", 1044);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        var command = new RecordSaleCommand { ArticleIds = ["ARTICLE001"] };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.not_sellable", exception.ErrorCode);
        var articleNumbers = Assert.IsAssignableFrom<List<int>>(exception.Extensions["articleNumbers"]);
        Assert.Equal([1044], articleNumbers);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_FirstArticleFineSecondViolates_ReportsOnlySecondArticleNumber_AndMakesNoWrites()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var fine = CreateSellingArticle("ARTICLE001", 1043);
        var violating = CreateArticle("ARTICLE002", 1044); // still Registered
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(fine);
        _articleRepository.Setup(r => r.GetById("ARTICLE002")).ReturnsAsync(violating);
        var command = new RecordSaleCommand { ArticleIds = ["ARTICLE001", "ARTICLE002"] };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.not_sellable", exception.ErrorCode);
        var articleNumbers = Assert.IsAssignableFrom<List<int>>(exception.Extensions["articleNumbers"]);
        Assert.Equal([1044], articleNumbers);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }
}
