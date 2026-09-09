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

    [Fact]
    public async Task HandleAsync_UnknownEmail_ThrowsUnauthorized()
    {
        _sellers.Setup(s => s.GetByEmailAsync("nobody@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);

        var ex = await Assert.ThrowsAsync<BAR.Domain.Exceptions.UnauthorizedException>(
            () => CreateHandler().HandleAsync(new LoginCommand("nobody@example.com", "x"), TestContext.Current.CancellationToken));

        Assert.Equal("Ungültige Anmeldedaten", ex.Message);
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
