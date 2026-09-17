using Bazaar.Application.Auth;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Moq;

namespace Bazaar.Application.UnitTests.Auth;

public class LoginHandlerTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();

    private LoginHandler CreateSut() =>
        new(_userRepository.Object, _passwordHasher.Object, _tokenIssuer.Object);

    [Fact]
    public async Task Handle_UserNotFound_ThrowsUnauthorizedWithInvalidCredentialsCode()
    {
        _userRepository.Setup(r => r.GetByUsername("unknown")).ReturnsAsync((User?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<UnauthorizedException>(
            () => sut.Handle(new LoginCommand { Username = "unknown", Password = "whatever" }));

        Assert.Equal("auth.invalid_credentials", exception.ErrorCode);
        Assert.Equal("Ungültige Anmeldedaten", exception.Message);
    }

    [Fact]
    public async Task Handle_WrongPassword_ThrowsSameUnauthorizedExceptionAsUserNotFound()
    {
        var user = User.Create("USER01", "cashier1", "hash", Role.Cashier, mustChangePassword: false);
        _userRepository.Setup(r => r.GetByUsername("cashier1")).ReturnsAsync(user);
        _passwordHasher.Setup(h => h.Verify("hash", "wrong")).Returns(false);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<UnauthorizedException>(
            () => sut.Handle(new LoginCommand { Username = "cashier1", Password = "wrong" }));

        // Same message + errorCode as the "user not found" case (AC-2 no-leak requirement).
        Assert.Equal("auth.invalid_credentials", exception.ErrorCode);
        Assert.Equal("Ungültige Anmeldedaten", exception.Message);
    }

    [Fact]
    public async Task Handle_CorrectCredentials_ReturnsTokenFromTokenIssuer()
    {
        var user = User.Create("USER01", "cashier1", "hash", Role.Cashier, mustChangePassword: false);
        _userRepository.Setup(r => r.GetByUsername("cashier1")).ReturnsAsync(user);
        _passwordHasher.Setup(h => h.Verify("hash", "correct")).Returns(true);
        _tokenIssuer.Setup(t => t.IssueAccessToken(user, It.IsAny<DateTime>())).Returns("issued-token");
        var sut = CreateSut();

        var token = await sut.Handle(new LoginCommand { Username = "cashier1", Password = "correct" });

        Assert.Equal("issued-token", token);
    }
}
