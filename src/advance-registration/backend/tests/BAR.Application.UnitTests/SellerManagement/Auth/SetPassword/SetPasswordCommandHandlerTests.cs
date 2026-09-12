using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Application.Auth.SetPassword;
using BAR.Modules.SellerManagement.Contracts.Auth;
using BAR.Modules.SellerManagement.Domain.Auth;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Auth.SetPassword;

public class SetPasswordCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public SetPasswordCommandHandlerTests()
    {
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns((Func<CancellationToken, Task> action, CancellationToken ct) => action(ct));
    }

    private SetPasswordCommandHandler CreateHandler() =>
        new(_sellers.Object, _refreshTokens.Object, _hasher.Object, _tokenIssuer.Object, _clock.Object, _unitOfWork.Object);

    [Fact]
    public async Task HandleAsync_ValidToken_SetsPasswordAndReturnsTokenPair()
    {
        var seller = Seller.CreateByAdmin("Anna", "Beispiel", null, "1", "Karlsruhe", "0", "anna@example.com", "t1", false);
        var now = DateTime.UtcNow;
        seller.GenerateInviteToken(now);
        _sellers.Setup(s => s.GetByInviteTokenAsync(seller.InviteToken!, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _clock.Setup(c => c.UtcNow).Returns(now);
        _hasher.Setup(h => h.Hash("geheim123")).Returns("hashed");
        _tokenIssuer.Setup(t => t.IssueAccessToken(seller.Id, "seller", now)).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        var handler = CreateHandler();

        var result = await handler.HandleAsync(new SetPasswordCommand(seller.InviteToken!, "geheim123"), TestContext.Current.CancellationToken);

        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("hashed", seller.PasswordHash);
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.AddAsync(It.IsAny<RefreshToken>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownToken_ThrowsUnauthorized()
    {
        _sellers.Setup(s => s.GetByInviteTokenAsync("bad-token", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => handler.HandleAsync(
            new SetPasswordCommand("bad-token", "geheim123"), TestContext.Current.CancellationToken));

        Assert.Equal("auth.invalid_invite_token", ex.ErrorCode);
    }
}
