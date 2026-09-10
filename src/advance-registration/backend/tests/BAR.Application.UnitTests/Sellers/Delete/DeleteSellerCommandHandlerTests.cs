using BAR.Application.Abstractions;
using BAR.Application.Sellers.Delete;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Sellers.Delete;

public class DeleteSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<INumberBlockRepository> _blocks = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IArticleRepository> _articles = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private DeleteSellerCommandHandler CreateHandler() =>
        new(_sellers.Object, _blocks.Object, _refreshTokens.Object, _articles.Object, _unitOfWork.Object);

    private void SetUpTransaction() =>
        _unitOfWork.Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));

    private static Seller AdminSeller(string email = "admin@bazaar.local") =>
        Seller.CreateByAdmin("Admin", "X", null, "1", "Karlsruhe", "0", email, "t1", true);

    [Fact]
    public async Task HandleAsync_OtherAdminDeletesNonSelfSeller_CascadesArticlesBlocksAndTokens()
    {
        SetUpTransaction();
        var target = Seller.CreateByAdmin("Ben", "Y", null, "1", "Berlin", "0", "ben@example.com", "t1", false);
        var requester = AdminSeller();
        _sellers.Setup(s => s.GetByIdAsync(target.Id, It.IsAny<CancellationToken>())).ReturnsAsync(target);
        _sellers.Setup(s => s.CountAdminsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(2);
        var handler = CreateHandler();

        await handler.HandleAsync(new DeleteSellerCommand(target.Id, requester.Id), TestContext.Current.CancellationToken);

        _articles.Verify(a => a.DeleteAllForSellerAsync(target.Id, It.IsAny<CancellationToken>()), Times.Once);
        _blocks.Verify(b => b.DeleteAllForSellerAsync(target.Id, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(target.Id, It.IsAny<CancellationToken>()), Times.Once);
        _sellers.Verify(s => s.DeleteAsync(target, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_SelfDelete_ThrowsConflict()
    {
        var requester = AdminSeller();
        _sellers.Setup(s => s.GetByIdAsync(requester.Id, It.IsAny<CancellationToken>())).ReturnsAsync(requester);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(() => handler.HandleAsync(
            new DeleteSellerCommand(requester.Id, requester.Id), TestContext.Current.CancellationToken));

        Assert.Equal("seller.self_delete_via_profile", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_LastAdmin_ThrowsConflict()
    {
        SetUpTransaction();
        var target = AdminSeller("last@bazaar.local");
        var requester = AdminSeller("other-admin@bazaar.local");
        _sellers.Setup(s => s.GetByIdAsync(target.Id, It.IsAny<CancellationToken>())).ReturnsAsync(target);
        _sellers.Setup(s => s.CountAdminsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.ConflictException>(() => handler.HandleAsync(
            new DeleteSellerCommand(target.Id, requester.Id), TestContext.Current.CancellationToken));

        Assert.Equal("seller.last_admin", ex.ErrorCode);
    }
}
