using Bazaar.Application.Settlement;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Settlement;

public class SettleSellerHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public SettleSellerHandlerTests()
    {
        // The real EfUnitOfWork opens a transaction and invokes the action —
        // here we just invoke the action directly so handler logic (including
        // any exception it throws) runs exactly as it would inside the
        // transaction, without a real database.
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private SettleSellerHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object, _unitOfWork.Object);

    private static Seller CreateSeller(decimal salesCommission = 15m) =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, "Karlsruhe", null, "anna@example.org", "SELLERTYPE001", salesCommission, 3.00m);

    private static Article CreateArticle(string id, int number, decimal price = 12.00m, string sellerId = "SELLER001") =>
        Article.Create(
            id, number, sellerId, "Winterjacke", "Nike", "Jacken", price,
            "128", "rot", null, DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddDays(-1));

    private static Article CreateSoldArticle(string id, int number, decimal price)
    {
        var article = CreateArticle(id, number, price);
        article.MarkReleased(DateTimeOffset.UtcNow.AddHours(-2));
        article.RecordSale(DateTimeOffset.UtcNow.AddHours(-1));
        return article;
    }

    private static Article CreateOpenArticle(string id, int number)
    {
        var article = CreateArticle(id, number);
        article.MarkReleased(DateTimeOffset.UtcNow.AddHours(-1));
        return article;
    }

    [Fact]
    public async Task Handle_SoldAndNotDeliveredArticles_SettlesSellerRemovesNotDelivered_AndReturnsResult()
    {
        var seller = CreateSeller(salesCommission: 15m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var sold1 = CreateSoldArticle("ARTICLE001", 1001, 50.00m);
        var sold2 = CreateSoldArticle("ARTICLE002", 1002, 37.50m);
        var notDelivered1 = CreateArticle("ARTICLE003", 1003);
        var notDelivered2 = CreateArticle("ARTICLE004", 1004);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001"))
            .ReturnsAsync([sold1, sold2, notDelivered1, notDelivered2]);

        var command = new SettleSellerCommand { SellerId = "SELLER001", PayoutAmount = 74.37m };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        // 87.50 revenue * 15% = 13.125 -> AwayFromZero -> 13.13 commission -> 74.37 payout
        Assert.Equal(74.37m, result.PayoutAmount);
        Assert.Equal(2, result.RemovedArticleCount);
        Assert.NotEqual(default, result.SettledAt);
        Assert.Equal(74.37m, seller.PayoutAmount);
        Assert.NotNull(seller.SettledAt);
        _sellerRepository.Verify(r => r.Update(seller), Times.Once);
        _articleRepository.Verify(r => r.Remove(notDelivered1), Times.Once);
        _articleRepository.Verify(r => r.Remove(notDelivered2), Times.Once);
        _articleRepository.Verify(r => r.Remove(sold1), Times.Never);
        _articleRepository.Verify(r => r.Remove(sold2), Times.Never);
    }

    [Fact]
    public async Task Handle_ArticleStillOpenInSelling_ThrowsConflictWithArticlesOpen_AndMakesNoWrites()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var open = CreateOpenArticle("ARTICLE001", 1001);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync([open]);

        var command = new SettleSellerCommand { SellerId = "SELLER001", PayoutAmount = 0m };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("settlement.articles_open", exception.ErrorCode);
        Assert.Equal(1, exception.Extensions["openCount"]);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SellerHasNoReleasedArticles_ThrowsConflictWithArticlesOpen_AndMakesNoWrites()
    {
        // Mirrors GetSellerSettlementHandler's canSettle = releasedCount > 0 && openCount == 0
        // (Round-20): a seller whose articles were never handed over (ReleasedAt == null) has
        // openCount == 0 too, so without this guard the handler would fall through, compute
        // revenue/payout as 0, and hard-delete every one of these never-released articles.
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var neverReleased1 = CreateArticle("ARTICLE001", 1001);
        var neverReleased2 = CreateArticle("ARTICLE002", 1002);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001"))
            .ReturnsAsync([neverReleased1, neverReleased2]);

        var command = new SettleSellerCommand { SellerId = "SELLER001", PayoutAmount = 0m };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("settlement.articles_open", exception.ErrorCode);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SellerAlreadySettled_ThrowsConflictWithAlreadySettled()
    {
        var seller = CreateSeller();
        seller.Settle(50.00m, DateTimeOffset.UtcNow.AddDays(-1));
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync([]);

        var command = new SettleSellerCommand { SellerId = "SELLER001", PayoutAmount = 0m };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("settlement.already_settled", exception.ErrorCode);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_PayoutAmountMismatch_ThrowsBadRequestWithPayoutMismatch_AndMakesNoWrites()
    {
        var seller = CreateSeller(salesCommission: 15m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var sold1 = CreateSoldArticle("ARTICLE001", 1001, 50.00m);
        var sold2 = CreateSoldArticle("ARTICLE002", 1002, 37.50m);
        _articleRepository.Setup(r => r.GetAllBySellerId("SELLER001")).ReturnsAsync([sold1, sold2]);

        // Correct payout is 74.37; command sends a cent off.
        var command = new SettleSellerCommand { SellerId = "SELLER001", PayoutAmount = 74.38m };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => sut.Handle(command));

        Assert.Equal("settlement.payout_mismatch", exception.ErrorCode);
        var errors = Assert.IsAssignableFrom<Dictionary<string, string[]>>(exception.Extensions["errors"]);
        Assert.True(errors.ContainsKey("payoutAmount"));
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
        _articleRepository.Verify(r => r.Remove(It.IsAny<Article>()), Times.Never);
    }

    [Fact]
    public async Task Handle_SellerNotFound_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var command = new SettleSellerCommand { SellerId = "SELLER001", PayoutAmount = 0m };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(command));

        Assert.Equal("seller.not_found", exception.ErrorCode);
    }
}
