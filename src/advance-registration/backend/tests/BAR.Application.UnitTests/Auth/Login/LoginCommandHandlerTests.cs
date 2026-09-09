using BAR.Application.Abstractions;
using BAR.Application.Auth.Login;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using Moq;

namespace BAR.Application.UnitTests.Auth.Login;

public class LoginCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IPasswordHasher> _hasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();

    private LoginCommandHandler CreateHandler() =>
        new(_sellers.Object, _refreshTokens.Object, _hasher.Object, _tokenIssuer.Object, _clock.Object);

    [Fact]
    public async Task HandleAsync_CorrectCredentials_ReturnsTokenPair()
    {
        var seller = Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "hashed");
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _hasher.Setup(h => h.Verify("geheim123", "hashed")).Returns(true);
        _tokenIssuer.Setup(t => t.IssueAccessToken(seller.Id, "seller", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);

        var result = await CreateHandler().HandleAsync(new LoginCommand("anna@example.com", "geheim123"), TestContext.Current.CancellationToken);

        Assert.Equal("access-token", result.AccessToken);
    }

    [Theory]
    [InlineData(5)]
    [InlineData(6)]
    public async Task HandleAsync_ActiveSessionsAtOrAboveCap_DropsOldestBeforeAddingNew(int activeSessions)
    {
        var seller = SetUpValidLogin();
        _refreshTokens.Setup(r => r.CountActiveForSellerAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(activeSessions);

        await CreateHandler().HandleAsync(new LoginCommand("anna@example.com", "geheim123"), TestContext.Current.CancellationToken);

        _refreshTokens.Verify(r => r.DeleteOldestForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.AddAsync(It.IsAny<BAR.Domain.Auth.RefreshToken>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_ActiveSessionsBelowCap_KeepsAllExistingSessions()
    {
        var seller = SetUpValidLogin();
        // Genau die Grenze von unten: bei 4 aktiven Sessions darf noch keine
        // geloescht werden, sonst waere die Kappung ">" statt ">=" 5.
        _refreshTokens.Setup(r => r.CountActiveForSellerAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(4);

        await CreateHandler().HandleAsync(new LoginCommand("anna@example.com", "geheim123"), TestContext.Current.CancellationToken);

        _refreshTokens.Verify(r => r.DeleteOldestForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
        _refreshTokens.Verify(r => r.AddAsync(It.IsAny<BAR.Domain.Auth.RefreshToken>(), It.IsAny<CancellationToken>()), Times.Once);
    }

    private Seller SetUpValidLogin()
    {
        var seller = Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "hashed");
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _hasher.Setup(h => h.Verify("geheim123", "hashed")).Returns(true);
        _tokenIssuer.Setup(t => t.IssueAccessToken(seller.Id, "seller", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plain");
        _clock.Setup(c => c.UtcNow).Returns(DateTime.UtcNow);
        return seller;
    }

    [Fact]
    public async Task HandleAsync_UnknownEmail_ThrowsUnauthorized()
    {
        _sellers.Setup(s => s.GetByEmailAsync("nobody@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(
            () => CreateHandler().HandleAsync(new LoginCommand("nobody@example.com", "x"), TestContext.Current.CancellationToken));

        Assert.Equal("Ungültige Anmeldedaten", ex.Message);
        // Auch ohne Treffer laeuft ein Verify gegen den Dummy-Hash, damit die
        // Antwortzeit nicht verraet, ob die E-Mail existiert.
        _hasher.Verify(h => h.Verify("x", It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WrongPassword_ThrowsSameUnauthorizedAsUnknownEmail()
    {
        var seller = Seller.Register("A", "B", null, "1", "C", "0", "anna@example.com", "t0000001", "hashed");
        _sellers.Setup(s => s.GetByEmailAsync("anna@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _hasher.Setup(h => h.Verify("wrong", "hashed")).Returns(false);

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(
            () => CreateHandler().HandleAsync(new LoginCommand("anna@example.com", "wrong"), TestContext.Current.CancellationToken));

        Assert.Equal("Ungültige Anmeldedaten", ex.Message);
    }
}
