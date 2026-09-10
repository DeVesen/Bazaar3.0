using BAR.Application.Abstractions;
using BAR.Application.Sellers;
using BAR.Domain.Exceptions;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers;

public class SellerCascadeDeleterTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private SellerCascadeDeleter CreateDeleter() =>
        new(_sellers.Object, _blocks.Object, _refreshTokens.Object, _articles.Object, _unitOfWork.Object);

    private void SetUpTransaction() =>
        _unitOfWork.Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));

    [Fact]
    public async Task DeleteAsync_GuardPasses_CascadesArticlesBlocksTokensThenSeller()
    {
        SetUpTransaction();
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        var deleter = CreateDeleter();

        await deleter.DeleteAsync(seller.Id, (_, _) => Task.CompletedTask, TestContext.Current.CancellationToken);

        _articles.Verify(a => a.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
        _blocks.Verify(b => b.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
        _sellers.Verify(s => s.DeleteAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_GuardThrows_DoesNotCascade()
    {
        SetUpTransaction();
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe",
            "0721 12345", "anna@example.com", "t1b2c3d4", "hashed");
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        var deleter = CreateDeleter();

        await Assert.ThrowsAsync<ConflictException>(() => deleter.DeleteAsync(
            seller.Id, (_, _) => throw new ConflictException("test.guard", "Guard-Fehler"), TestContext.Current.CancellationToken));

        _articles.Verify(a => a.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
        _sellers.Verify(s => s.DeleteAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_UnknownSellerId_ThrowsNotFound()
    {
        _sellers.Setup(s => s.GetByIdAsync("unknown", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        SetUpTransaction();
        var deleter = CreateDeleter();

        var ex = await Assert.ThrowsAsync<NotFoundException>(() => deleter.DeleteAsync(
            "unknown", (_, _) => Task.CompletedTask, TestContext.Current.CancellationToken));

        Assert.Equal("seller.not_found", ex.ErrorCode);
    }
}
