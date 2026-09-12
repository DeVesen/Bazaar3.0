using BAR.Modules.SellerManagement.Application.Sellers;
using BAR.Modules.SellerManagement.Application.Sellers.Delete;
using BAR.Modules.SellerManagement.Contracts.Sellers;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Sellers.Delete;

public class DeleteSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<ISellerCascadeDeleter> _cascadeDeleter = new();

    private DeleteSellerCommandHandler CreateHandler() =>
        new(_sellers.Object, _cascadeDeleter.Object);

    private static Seller AdminSeller(string email = "admin@bazaar.local") =>
        Seller.CreateByAdmin("Admin", "X", null, "1", "Karlsruhe", "0", email, "t1", true);

    [Fact]
    public async Task HandleAsync_OtherAdminDeletesNonSelfSeller_CallsCascadeDeleterWithTargetId()
    {
        var target = Seller.CreateByAdmin("Ben", "Y", null, "1", "Berlin", "0", "ben@example.com", "t1", false);
        var requester = AdminSeller();
        _cascadeDeleter
            .Setup(c => c.DeleteAsync(target.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns(Task.CompletedTask);
        var handler = CreateHandler();

        await handler.HandleAsync(new DeleteSellerCommand(target.Id, requester.Id), TestContext.Current.CancellationToken);

        _cascadeDeleter.Verify(c => c.DeleteAsync(
            target.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_SelfDelete_ThrowsConflict()
    {
        var requester = AdminSeller();
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() => handler.HandleAsync(
            new DeleteSellerCommand(requester.Id, requester.Id), TestContext.Current.CancellationToken));

        Assert.Equal("seller.self_delete_via_profile", ex.ErrorCode);
        _cascadeDeleter.Verify(c => c.DeleteAsync(
            It.IsAny<string>(), It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_LastAdminGuard_ThrowsConflict()
    {
        var target = AdminSeller("last@bazaar.local");
        var requester = AdminSeller("other-admin@bazaar.local");
        _sellers.Setup(s => s.CountAdminsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(1);
        _cascadeDeleter
            .Setup(c => c.DeleteAsync(target.Id, It.IsAny<Func<Seller, CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<string, Func<Seller, CancellationToken, Task>, CancellationToken>((_, guard, ct) => guard(target, ct));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() => handler.HandleAsync(
            new DeleteSellerCommand(target.Id, requester.Id), TestContext.Current.CancellationToken));

        Assert.Equal("seller.last_admin", ex.ErrorCode);
    }
}
