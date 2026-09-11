using BAR.Modules.Verkaeuferverwaltung.Application.Abstractions;
using BAR.Modules.Verkaeuferverwaltung.Application.Profile.ChangePassword;
using BAR.Modules.Verkaeuferverwaltung.Contracts.Profile;
using BAR.Modules.Verkaeuferverwaltung.Domain.Auth;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using BAR.SharedKernel;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.Verkaeuferverwaltung.Profile.ChangePassword;

public class ChangePasswordCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IRefreshTokenRepository> _refreshTokens = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly Mock<IClock> _clock = new();
    private readonly Mock<IUnitOfWork> _unitOfWork = new();

    private ChangePasswordCommandHandler CreateHandler() =>
        new(_sellers.Object, _refreshTokens.Object, _passwordHasher.Object, _tokenIssuer.Object, _clock.Object, _unitOfWork.Object);

    private void SetUpTransaction() =>
        _unitOfWork.Setup(u => u.ExecuteInTransactionAsync(It.IsAny<Func<CancellationToken, Task>>(), It.IsAny<CancellationToken>()))
            .Returns<Func<CancellationToken, Task>, CancellationToken>((action, ct) => action(ct));

    private static Seller ExistingSeller() =>
        Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 12345",
            "anna@example.com", "t1b2c3d4", "hashed-old");

    [Fact]
    public async Task HandleAsync_CorrectPasswordAndMatchingConfirmation_RotatesTokensForCallingDevice()
    {
        SetUpTransaction();
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _passwordHasher.Setup(p => p.Verify("geheim123!", "hashed-old")).Returns(true);
        _passwordHasher.Setup(p => p.Hash("neuGeheim456!")).Returns("hashed-new");
        _clock.SetupGet(c => c.UtcNow).Returns(new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc));
        _tokenIssuer.Setup(t => t.IssueAccessToken(seller.Id, "seller", It.IsAny<DateTime>())).Returns("access-token");
        _tokenIssuer.Setup(t => t.GenerateRefreshTokenPlainText()).Returns("refresh-plaintext");
        var handler = CreateHandler();

        var result = await handler.HandleAsync(seller.Id,
            new ChangePasswordCommand("geheim123!", "neuGeheim456!", "neuGeheim456!"), TestContext.Current.CancellationToken);

        Assert.Equal("hashed-new", seller.PasswordHash);
        Assert.Equal("access-token", result.AccessToken);
        Assert.Equal("refresh-plaintext", result.RefreshToken);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(seller.Id, It.IsAny<CancellationToken>()), Times.Once);
        _refreshTokens.Verify(r => r.AddAsync(It.Is<RefreshToken>(rt => rt.SellerId == seller.Id), It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WrongCurrentPassword_ThrowsUnauthorized_DoesNotTouchTokens()
    {
        SetUpTransaction();
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _passwordHasher.Setup(p => p.Verify("falsch", "hashed-old")).Returns(false);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => handler.HandleAsync(
            seller.Id, new ChangePasswordCommand("falsch", "neuGeheim456!", "neuGeheim456!"), TestContext.Current.CancellationToken));

        Assert.Equal("auth.invalid_credentials", ex.ErrorCode);
        _refreshTokens.Verify(r => r.DeleteAllForSellerAsync(It.IsAny<string>(), It.IsAny<CancellationToken>()), Times.Never);
    }
}
