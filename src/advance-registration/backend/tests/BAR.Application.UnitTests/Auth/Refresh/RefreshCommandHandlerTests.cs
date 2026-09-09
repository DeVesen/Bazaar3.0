using BAR.Application.Abstractions;
using BAR.Application.Auth.Refresh;
using BAR.Domain.Auth;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Auth.Refresh;

public class RefreshCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    public RefreshCommandHandlerTests()
    {
        // Fuehrt den Delegaten direkt aus - die Transaktionsklammer selbst ist
        // Infrastruktur und wird hier nicht nachgebaut.
        _unitOfWork
            .Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));
    }

    private RefreshCommandHandler CreateHandler() =>
        new(_sellers.Object, _refreshTokens.Object, _tokenIssuer.Object, _clock.Object, _unitOfWork.Object);

    [Fact]
    public async Task HandleAsync_ValidToken_RotatesAndReturnsNewPair()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = DateTime.UtcNow;
        var seller = Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "hashed");
        var existing = RefreshToken.Issue(seller.Id, "old-plain", now.AddDays(-1), now.AddDays(29));
        _refreshTokens.Setup(r => r.GetByHashAsync(RefreshToken.HashOf("old-plain"), It.IsAny<CancellationToken>())).ReturnsAsync(existing);
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _tokenIssuer.Setup(t => t.IssueAccessToken(seller.Id, "seller", It.IsAny<DateTime>())).Returns("new-access");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("new-refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(now);

        var result = await CreateHandler().HandleAsync(new RefreshCommand("old-plain"), ct);

        Assert.Equal("new-access", result.AccessToken);
        Assert.Equal("new-refresh-plain", result.RefreshToken);
        _refreshTokens.Verify(r => r.DeleteAsync(existing.Id, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.AddAsync(It.IsAny<RefreshToken>(), It.IsAny<CancellationToken>()), Times.Once);
        // Loeschen und Anlegen duerfen nicht als zwei unabhaengige Commits laufen.
        _unitOfWork.Verify(u => u.ExecuteInTransactionAsync(
            It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_UnknownToken_ThrowsUnauthorized()
    {
        var ct = TestContext.Current.CancellationToken;
        _refreshTokens.Setup(r => r.GetByHashAsync(It.IsAny<string>(), It.IsAny<CancellationToken>())).ReturnsAsync((RefreshToken?)null);

        await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(
            () => CreateHandler().HandleAsync(new RefreshCommand("unknown"), ct));
    }

    [Fact]
    public async Task HandleAsync_ExpiredToken_ThrowsUnauthorized()
    {
        var ct = TestContext.Current.CancellationToken;
        var now = DateTime.UtcNow;
        var expired = RefreshToken.Issue("s1", "expired-plain", now.AddDays(-31), now.AddDays(-1));
        _refreshTokens.Setup(r => r.GetByHashAsync(RefreshToken.HashOf("expired-plain"), It.IsAny<CancellationToken>())).ReturnsAsync(expired);
        _clock.Setup(c => c.UtcNow).Returns(now);

        await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(
            () => CreateHandler().HandleAsync(new RefreshCommand("expired-plain"), ct));
    }
}
