using Bazaar.Application.Release;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Release;

public class ReleaseHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public ReleaseHandlerTests()
    {
        // The real EfUnitOfWork opens a transaction and invokes the action —
        // here we just invoke the action directly so handler logic (including
        // any exception it throws) runs exactly as it would inside the
        // transaction, without a real database.
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private ReleaseHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object, _unitOfWork.Object);

    private static Seller CreateSeller(decimal feePerItem = 3.00m) =>
        Seller.Create("SELLER001", "Anna", "Meier", null, null, null, null, "anna@example.org", "SELLERTYPE001", 10m, feePerItem);

    private static Article CreateArticle(string id, int number, string sellerId = "SELLER001") =>
        Article.Create(
            id, number, sellerId, "Winterjacke", "Nike", "Jacken", 12.00m,
            "128", "rot", null, DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddDays(-1));

    [Fact]
    public async Task Handle_AllArticlesReleasable_ReleasesAllAddsFeeAndReturnsResult()
    {
        var seller = CreateSeller(feePerItem: 5.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var article1 = CreateArticle("ARTICLE001", 1043);
        var article2 = CreateArticle("ARTICLE002", 1044);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article1);
        _articleRepository.Setup(r => r.GetById("ARTICLE002")).ReturnsAsync(article2);
        var command = new ReleaseCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 10.00m, // 2 articles * 5.00
            ArticleIds = ["ARTICLE001", "ARTICLE002"],
        };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(2, result.ReleasedCount);
        Assert.Equal(10.00m, result.IntakeFeePaid);
        Assert.Equal(10.00m, seller.IntakeFeePaid);
        Assert.NotNull(article1.ReleasedAt);
        Assert.NotNull(article2.ReleasedAt);
        _articleRepository.Verify(r => r.Update(article1), Times.Once);
        _articleRepository.Verify(r => r.Update(article2), Times.Once);
        _sellerRepository.Verify(r => r.Update(seller), Times.Once);
    }

    /// <summary>
    /// Regression test for the retry-safety pattern: a CreateExecutionStrategy
    /// retry re-invokes the whole transaction closure. Mutating the `seller`
    /// instance fetched BEFORE the transaction (used only for the fail-fast fee
    /// check) would double-apply AddIntakeFeePaid across attempts. The handler
    /// must instead re-fetch seller inside the closure and mutate that fresh
    /// instance — proven here by returning two DIFFERENT Seller instances from
    /// the two GetById calls and asserting only the second ends up mutated.
    /// </summary>
    [Fact]
    public async Task Handle_FetchesSellerFreshInsideTransactionClosure_MutatesOnlyTheFreshInstance()
    {
        var outerSeller = CreateSeller(feePerItem: 5.00m);
        var freshSeller = CreateSeller(feePerItem: 5.00m);
        _sellerRepository.SetupSequence(r => r.GetById("SELLER001"))
            .ReturnsAsync(outerSeller)
            .ReturnsAsync(freshSeller);
        var article = CreateArticle("ARTICLE001", 1043);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        var command = new ReleaseCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 5.00m,
            ArticleIds = ["ARTICLE001"],
        };
        var sut = CreateSut();

        var result = await sut.Handle(command);

        Assert.Equal(0m, outerSeller.IntakeFeePaid);
        Assert.Equal(5.00m, freshSeller.IntakeFeePaid);
        Assert.Equal(5.00m, result.IntakeFeePaid);
        _sellerRepository.Verify(r => r.GetById("SELLER001"), Times.Exactly(2));
        _sellerRepository.Verify(r => r.Update(freshSeller), Times.Once);
        _sellerRepository.Verify(r => r.Update(outerSeller), Times.Never);
    }

    [Fact]
    public async Task Handle_ArticleAlreadyReleasedBetweenScanAndBooking_ThrowsConflictWithArticleNumbers_AndMakesNoWrites()
    {
        var seller = CreateSeller(feePerItem: 5.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        // Simulates a concurrent release that happened between the frontend's
        // scan-time check and this booking call: ReleasedAt is already set
        // directly after loading, before commit.
        var alreadyReleased = CreateArticle("ARTICLE001", 1044);
        alreadyReleased.MarkReleased(DateTimeOffset.UtcNow);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(alreadyReleased);

        var command = new ReleaseCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 5.00m,
            ArticleIds = ["ARTICLE001"],
        };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.not_releasable", exception.ErrorCode);
        var articleNumbers = Assert.IsAssignableFrom<List<int>>(exception.Extensions["articleNumbers"]);
        Assert.Equal([1044], articleNumbers);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
        Assert.Equal(0m, seller.IntakeFeePaid);
    }

    [Fact]
    public async Task Handle_ArticleBelongsToDifferentSeller_ThrowsConflictWithArticleNumbers_AndMakesNoWrites()
    {
        var seller = CreateSeller(feePerItem: 5.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);

        var otherSellersArticle = CreateArticle("ARTICLE001", 1044, sellerId: "SELLER999");
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(otherSellersArticle);

        var command = new ReleaseCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 5.00m,
            ArticleIds = ["ARTICLE001"],
        };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("article.not_releasable", exception.ErrorCode);
        var articleNumbers = Assert.IsAssignableFrom<List<int>>(exception.Extensions["articleNumbers"]);
        Assert.Equal([1044], articleNumbers);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
    }

    [Fact]
    public async Task Handle_FeeAmountMismatch_ThrowsBadRequestException_AndMakesNoWrites()
    {
        var seller = CreateSeller(feePerItem: 5.00m);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var command = new ReleaseCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 8.00m, // expected 2 * 5.00 = 10.00
            ArticleIds = ["ARTICLE001", "ARTICLE002"],
        };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<BadRequestException>(() => sut.Handle(command));

        Assert.Equal("release.fee_mismatch", exception.ErrorCode);
        _articleRepository.Verify(r => r.GetById(It.IsAny<string>()), Times.Never);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
        _sellerRepository.Verify(r => r.Update(It.IsAny<Seller>()), Times.Never);
        _unitOfWork.Verify(
            u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()),
            Times.Never);
    }

    [Fact]
    public async Task Handle_SellerNotFound_ThrowsNotFoundWithSellerNotFoundCode()
    {
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync((Seller?)null);
        var command = new ReleaseCommand
        {
            SellerId = "SELLER001",
            FeeAmount = 5.00m,
            ArticleIds = ["ARTICLE001"],
        };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(command));

        Assert.Equal("seller.not_found", exception.ErrorCode);
    }
}
