using Bazaar.Application.Sales;
using Bazaar.Domain.Articles;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Sellers;
using Moq;

namespace Bazaar.Application.UnitTests.Sales;

public class UndoSaleHandlerTests
{
    private readonly Mock<IArticleRepository> _articleRepository = new();
    private readonly Mock<ISellerRepository> _sellerRepository = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public UndoSaleHandlerTests()
    {
        // The real EfUnitOfWork opens a transaction and invokes the action —
        // here we just invoke the action directly so handler logic (including
        // any exception it throws) runs exactly as it would inside the
        // transaction, without a real database.
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private UndoSaleHandler CreateSut() => new(_articleRepository.Object, _sellerRepository.Object, _unitOfWork.Object);

    private static Seller CreateSeller(string id = "SELLER001") =>
        Seller.Create(id, "Anna", "Meier", null, null, null, null, "anna@example.org", "SELLERTYPE001", 10m, 3.00m);

    private static Article CreateSoldArticle(string id, int number, string sellerId = "SELLER001")
    {
        var article = Article.Create(
            id, number, sellerId, "Winterjacke", "Nike", "Jacken", 12.00m,
            "128", "rot", null, DateTimeOffset.UtcNow.AddDays(-1), DateTimeOffset.UtcNow.AddDays(-1));
        article.MarkReleased(DateTimeOffset.UtcNow);
        article.RecordSale(DateTimeOffset.UtcNow);
        return article;
    }

    [Fact]
    public async Task Handle_SellerNotSettled_UndoesSaleAndUpdatesArticle()
    {
        var seller = CreateSeller();
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var article = CreateSoldArticle("ARTICLE001", 1044);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        var command = new UndoSaleCommand { ArticleIds = ["ARTICLE001"] };
        var sut = CreateSut();

        await sut.Handle(command);

        Assert.Null(article.SoldAt);
        _articleRepository.Verify(r => r.Update(article), Times.Once);
    }

    [Fact]
    public async Task Handle_SellerAlreadySettled_ThrowsConflict_AndMakesNoWrites()
    {
        var seller = CreateSeller();
        seller.Settle(42.00m, DateTimeOffset.UtcNow);
        _sellerRepository.Setup(r => r.GetById("SELLER001")).ReturnsAsync(seller);
        var article = CreateSoldArticle("ARTICLE001", 1044);
        _articleRepository.Setup(r => r.GetById("ARTICLE001")).ReturnsAsync(article);
        var command = new UndoSaleCommand { ArticleIds = ["ARTICLE001"] };
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(command));

        Assert.Equal("settlement.locked", exception.ErrorCode);
        _articleRepository.Verify(r => r.Update(It.IsAny<Article>()), Times.Never);
    }
}
