using BAR.Modules.Registration.Contracts;
using BAR.Modules.Registration.Contracts.Blocks;
using BAR.Modules.SellerManagement.Application.Sellers;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Sellers;

public class SellerBlockAllocationCoordinatorTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IRegistrationModuleApi> _registration = new();

    private SellerBlockAllocationCoordinator CreateCoordinator() =>
        new(_sellers.Object, _refreshTokens.Object, _registration.Object);

    [Fact]
    public async Task AllocateOrCompensateAsync_AllocationSucceeds_ReturnsBlocksWithoutTouchingSeller()
    {
        var blocks = new List<BlockDto> { new("b1", "s1", 1, 10, 10, 0, DateTime.UtcNow) };
        _registration.Setup(a => a.AllocateInitialBlocksAsync("s1", null, null, It.IsAny<CancellationToken>())).ReturnsAsync(blocks);

        var result = await CreateCoordinator().AllocateOrCompensateAsync("s1", null, null, TestContext.Current.CancellationToken);

        Assert.Same(blocks, result);
        _sellers.Verify(s => s.DeleteAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task AllocateOrCompensateAsync_AllocationFails_DeletesSellerAndTokensThenRethrows()
    {
        var seller = Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "t1", "hash");
        _registration.Setup(a => a.AllocateInitialBlocksAsync("s1", null, null, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("boom"));
        _sellers.Setup(s => s.GetByIdAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync(seller);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            CreateCoordinator().AllocateOrCompensateAsync("s1", null, null, TestContext.Current.CancellationToken));

        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync("s1", It.IsAny<CancellationToken>()), Times.Once);
        _sellers.Verify(s => s.DeleteAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task AllocateOrCompensateAsync_AllocationFailsAndSellerAlreadyGone_StillRethrowsWithoutDeletingAgain()
    {
        _registration.Setup(a => a.AllocateInitialBlocksAsync("s1", null, null, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new InvalidOperationException("boom"));
        _sellers.Setup(s => s.GetByIdAsync("s1", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);

        await Assert.ThrowsAsync<InvalidOperationException>(() =>
            CreateCoordinator().AllocateOrCompensateAsync("s1", null, null, TestContext.Current.CancellationToken));

        _sellers.Verify(s => s.DeleteAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
