using BAR.Modules.Registration.Contracts;
using BAR.Modules.MasterData.Contracts;
using BAR.Modules.MasterData.Contracts.SellerTypes;
using BAR.Modules.SellerManagement.Application.Sellers;
using BAR.Modules.SellerManagement.Application.Sellers.Create;
using BAR.Modules.SellerManagement.Contracts.Sellers;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Sellers.Create;

public class CreateSellerCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IMasterDataModuleApi> _masterData = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IRegistrationModuleApi> _registration = new();

    private CreateSellerCommandHandler CreateHandler() => new(
        _sellers.Object, _masterData.Object,
        new SellerBlockAllocationCoordinator(_sellers.Object, _refreshTokens.Object, _registration.Object));

    private static CreateSellerCommand ValidCommand(int? startNumber = null) =>
        new("Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", false, startNumber, null);

    private void SetUpHappyPath()
    {
        _masterData.Setup(t => t.GetSellerTypeConditionsAsync("t0000001", It.IsAny<CancellationToken>()))
            .ReturnsAsync(new SellerTypeConditionsDto("t0000001", "Standard", 0.1m, 0.5m));
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _registration.Setup(a => a.AllocateInitialBlocksAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync([new BAR.Modules.Registration.Contracts.Blocks.BlockDto("b1", "s1", 1, 10, 10, 0, DateTime.UtcNow)]);
    }

    [Fact]
    public async Task HandleAsync_NewEmail_CreatesSellerWithoutPasswordAndReservesBlocks()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        var response = await handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.Equal("anna@example.com", response.Email);
        Assert.False(response.HasPendingInvite);
        _sellers.Verify(s => s.AddAsync(It.Is<Seller>(x => x.PasswordHash == null), It.IsAny<CancellationToken>()), Times.Once);
        _registration.Verify(a => a.AllocateInitialBlocksAsync(It.IsAny<string>(), null, null, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyRegistered_ThrowsConflict()
    {
        SetUpHappyPath();
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.CreateByAdmin("X", "Y", null, "1", "Z", "0", "anna@example.com", "t0000001", false));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_BlockAllocationFails_CompensatesByDeletingSellerAndRethrows()
    {
        SetUpHappyPath();
        _registration.Setup(a => a.AllocateInitialBlocksAsync(It.IsAny<string>(), It.IsAny<int?>(), It.IsAny<int?>(), It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ConflictException("block.overlap", "Nummernbereich überschneidet sich mit bestehendem Block"));
        // The compensation re-reads the just-created seller by id in order to
        // delete it - its concrete id is irrelevant for this test.
        _sellers.Setup(s => s.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", "anna@example.com", "t0000001", false));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(startNumber: 0), TestContext.Current.CancellationToken));

        Assert.Equal("block.overlap", ex.ErrorCode);
        _sellers.Verify(s => s.AddAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Once);
        _sellers.Verify(s => s.DeleteAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownSellerTypeId_ThrowsNotFoundAndDoesNotCreateSeller()
    {
        SetUpHappyPath();
        _masterData.Setup(t => t.GetSellerTypeConditionsAsync("t0000001", It.IsAny<CancellationToken>()))
            .ReturnsAsync((SellerTypeConditionsDto?)null);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<NotFoundException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("seller_type.not_found", ex.ErrorCode);
        _sellers.Verify(s => s.AddAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
