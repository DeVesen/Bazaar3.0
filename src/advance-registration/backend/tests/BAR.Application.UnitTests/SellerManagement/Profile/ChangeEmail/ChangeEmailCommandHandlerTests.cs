using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Application.Profile.ChangeEmail;
using BAR.Modules.SellerManagement.Contracts.Profile;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using BAR.SharedKernel.Exceptions;
using Moq;

namespace BAR.Application.UnitTests.SellerManagement.Profile.ChangeEmail;

public class ChangeEmailCommandHandlerTests
{
    private readonly Mock<ISellerRepository> _sellers = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();

    private ChangeEmailCommandHandler CreateHandler() => new(_sellers.Object, _passwordHasher.Object);

    private static Seller ExistingSeller() =>
        Seller.Register("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 12345",
            "anna@example.com", "t1b2c3d4", "hashed-old");

    [Fact]
    public async Task HandleAsync_CorrectPasswordAndFreeEmail_UpdatesEmail()
    {
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("anna.neu@example.com", It.IsAny<CancellationToken>())).ReturnsAsync((Seller?)null);
        _passwordHasher.Setup(p => p.Verify("geheim123!", "hashed-old")).Returns(true);
        var handler = CreateHandler();

        await handler.HandleAsync(seller.Id, new ChangeEmailCommand("anna.neu@example.com", "geheim123!"), TestContext.Current.CancellationToken);

        Assert.Equal("anna.neu@example.com", seller.Email);
        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task HandleAsync_WrongPassword_ThrowsUnauthorized()
    {
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _passwordHasher.Setup(p => p.Verify("falsch", "hashed-old")).Returns(false);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<UnauthorizedException>(() => handler.HandleAsync(
            seller.Id, new ChangeEmailCommand("anna.neu@example.com", "falsch"), TestContext.Current.CancellationToken));

        Assert.Equal("auth.invalid_credentials", ex.ErrorCode);
        _sellers.Verify(s => s.UpdateAsync(It.IsAny<Seller>(), It.IsAny<CancellationToken>()), Times.Never);
    }

    [Fact]
    public async Task HandleAsync_EmailAlreadyTakenByOtherSeller_ThrowsConflict()
    {
        var seller = ExistingSeller();
        var other = Seller.Register("Ben", "Y", null, "1", "Berlin", "0", "ben@example.com", "t1", "hashed-ben");
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync("ben@example.com", It.IsAny<CancellationToken>())).ReturnsAsync(other);
        _passwordHasher.Setup(p => p.Verify("geheim123!", "hashed-old")).Returns(true);
        var handler = CreateHandler();

        var ex = await Assert.ThrowsAsync<ConflictException>(() => handler.HandleAsync(
            seller.Id, new ChangeEmailCommand("ben@example.com", "geheim123!"), TestContext.Current.CancellationToken));

        Assert.Equal("seller.email_taken", ex.ErrorCode);
    }

    [Fact]
    public async Task HandleAsync_UnchangedOwnEmail_DoesNotThrowConflict()
    {
        var seller = ExistingSeller();
        _sellers.Setup(s => s.GetByIdAsync(seller.Id, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _sellers.Setup(s => s.GetByEmailAsync(seller.Email, It.IsAny<CancellationToken>())).ReturnsAsync(seller);
        _passwordHasher.Setup(p => p.Verify("geheim123!", "hashed-old")).Returns(true);
        var handler = CreateHandler();

        await handler.HandleAsync(seller.Id, new ChangeEmailCommand(seller.Email, "geheim123!"), TestContext.Current.CancellationToken);

        _sellers.Verify(s => s.UpdateAsync(seller, It.IsAny<CancellationToken>()), Times.Once);
    }
}
