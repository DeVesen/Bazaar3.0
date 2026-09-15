using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Application.Auth.BootstrapAdmin;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Auth.BootstrapAdmin;

public class BootstrapAdminCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();
    private readonly AdminBootstrapState _bootstrapState = new();

    public BootstrapAdminCommandHandlerTests()
    {
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private BootstrapAdminCommandHandler CreateHandler() => new(
        _sellers.Object, _refreshTokens.Object, _hasher.Object, _tokenIssuer.Object,
        _clock.Object, _unitOfWork.Object, _bootstrapState);

    private void SetUpHappyPath()
    {
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _hasher.Setup(h => h.Hash("geheim123")).Returns("hashed");
        _tokenIssuer.Setup(t => t.IssueAccessToken(It.IsAny<string>(), "admin", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);
    }

    private static RegisterCommand ValidCommand(string email = "anna@example.com") =>
        new(email, "geheim123", "Anna", "Beispiel", "Hauptstr. 1", "76133", "Karlsruhe", "0721 12345");

    [Fact]
    public async Task HandleAsync_NoAdminYet_CreatesAdminSellerAndReturnsTokenPair()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        var result = await handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-plain", result.RefreshToken);
        _sellers.Verify(s => s.AddAsync(It.Is<Seller>(x =>
            x.Email == "anna@example.com" && x.IsAdmin && x.SellerTypeId == "t0000001" &&
            x.FirstName == "Anna" && x.LastName == "Beispiel"), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_NoAdminYet_MarksBootstrapStateDone()
    {
        SetUpHappyPath();
        var handler = CreateHandler();

        await handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken);

        Assert.True(_bootstrapState.HasAdmin);
    }

    [Fact]
    public async Task HandleAsync_AdminAlreadyExists_ThrowsConflictAndDoesNotTouchRepository()
    {
        SetUpHappyPath();
        _bootstrapState.Initialize(true);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(
            () => handler.HandleAsync(ValidCommand(), TestContext.Current.CancellationToken));

        Assert.Equal("bootstrap.already_done", ex.ErrorCode);
        _sellers.Verify(s => s.AddAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
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
}
