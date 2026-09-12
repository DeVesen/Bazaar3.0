using BAR.Modules.Registration.Contracts;
using BAR.Modules.Registration.Contracts.Blocks;
using BAR.Modules.Operations.Contracts;
using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Application.Auth.Register;
using BAR.Modules.SellerManagement.Application.Sellers;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Auth.Register;

public class RegisterCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IOperationsModuleApi> _operations = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    // AllocateInitialBlocksAsync (retry-on-overlap etc.) lives and is tested in
    // Registration.Application.Blocks.AllocateInitialBlocksService - here a mock
    // of the facade is enough, which the real SellerBlockAllocationCoordinator
    // (no interface, so it's instantiated for real instead of mocked) calls into.
    private readonly Mock<IRegistrationModuleApi> _registration = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public RegisterCommandHandlerTests()
    {
        // The transaction wrapper itself belongs to Infrastructure; here the
        // given delegate is simply executed directly, so the asserts on the
        // repository calls still apply unchanged.
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private RegisterCommandHandler CreateHandler() => new(
        _sellers.Object, _refreshTokens.Object, _operations.Object,
        new SellerBlockAllocationCoordinator(_sellers.Object, _refreshTokens.Object, _registration.Object),
        _hasher.Object, _tokenIssuer.Object, _clock.Object, _unitOfWork.Object);

    private void SetUpHappyPath()
    {
        _operations.Setup(s => s.GetSettingsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(
            new SettingsDto(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
                "t0000001", null, StartNumber: 1, BlockSize: 10, DefaultBlockCount: 1));
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _registration.Setup(a => a.AllocateInitialBlocksAsync(It.IsAny<string>(), null, null, It.IsAny<CancellationToken>()))
            .ReturnsAsync([new BlockDto("b1", "s1", 1, 10, 10, 0, DateTime.UtcNow)]);
        _hasher.Setup(h => h.Hash("geheim123")).Returns("hashed");
        // Seller.Id is a random 8-character EntityId (EntityId.New()), hence
        // It.IsAny here instead of a fixed literal - the handler passes on the
        // actually generated id, whose concrete value is irrelevant for this test.
        _tokenIssuer.Setup(t => t.IssueAccessToken(It.IsAny<string>(), "seller", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);
    }

    private static RegisterCommand ValidCommand(string email = "anna@example.com") =>
        new(email, "geheim123", "Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe", "0721 12345");

    [Fact]
    public async Task HandleAsync_NewEmail_CreatesSellerAndReturnsTokenPair()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-plain", result.RefreshToken);
        _sellers.Verify(s => s.AddAsync(It.Is<Seller>(x =>
            x.Email == "anna@example.com" && x.SellerTypeId == "t0000001" &&
            x.FirstName == "Anna" && x.LastName == "Beispiel" && x.PostalCode == "76133" &&
            x.City == "Karlsruhe" && x.Phone == "0721 12345"), It.IsAny<CancellationToken>()), Times.Once);
        _registration.Verify(a => a.AllocateInitialBlocksAsync(It.IsAny<string>(), null, null, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyRegistered_ThrowsConflict()
    {
        SetUpHappyPath();
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "x"));
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_WholeRegistration_RunsInsideOneTransaction()
    {
        SetUpHappyPath();

        await CreateHandler().HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        _unitOfWork.Verify(u => u.ExecuteInTransactionAsync(
            It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_BlockAllocationFails_CompensatesByDeletingSellerAndRethrows()
    {
        SetUpHappyPath();
        _registration.Setup(a => a.AllocateInitialBlocksAsync(It.IsAny<string>(), null, null, It.IsAny<CancellationToken>()))
            .ThrowsAsync(new ConflictException("block.overlap", "Nummernvergabe momentan ueberlastet"));
        // The compensation re-reads the just-created seller by id in order to
        // delete it - its concrete id is irrelevant for this test.
        _sellers.Setup(s => s.GetByIdAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync(Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 12345", "anna@example.com", "t0000001", "hashed"));

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => CreateHandler().HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("block.overlap", ex.ErrorCode);
        _sellers.Verify(s => s.DeleteAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_NoDefaultTypeConfigured_ThrowsRegistrationNotEnabled()
    {
        _operations.Setup(s => s.GetSettingsAsync(It.IsAny<CancellationToken>())).ReturnsAsync((SettingsDto?)null);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("registration.not_enabled", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_SettingsExistButDefaultTypeIdIsNull_ThrowsRegistrationNotEnabled()
    {
        var settings = new SettingsDto(DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow, DateTime.UtcNow,
            DefaultTypeId: null, null, StartNumber: 1, BlockSize: 10, DefaultBlockCount: 1);
        _operations.Setup(s => s.GetSettingsAsync(It.IsAny<CancellationToken>())).ReturnsAsync(settings);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("registration.not_enabled", ex.ErrorCode);
    }
}
