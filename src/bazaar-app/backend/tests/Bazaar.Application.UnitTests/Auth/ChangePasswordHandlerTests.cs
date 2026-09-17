using Bazaar.Application.Auth;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Moq;

namespace Bazaar.Application.UnitTests.Auth;

public class ChangePasswordHandlerTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();

    private ChangePasswordHandler CreateSut() =>
        new(_userRepository.Object, _passwordHasher.Object, _tokenIssuer.Object);

    [Fact]
    public async Task Handle_WrongCurrentPassword_ThrowsUnauthorizedWithInvalidCredentialsCode()
    {
        var user = User.Create("USER01", "cashier1", "hash", Role.Cashier, mustChangePassword: false);
        _userRepository.Setup(r => r.GetById("USER01")).ReturnsAsync(user);
        _passwordHasher.Setup(h => h.Verify("hash", "wrong")).Returns(false);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<UnauthorizedException>(() => sut.Handle(
            new ChangePasswordCommand { UserId = "USER01", CurrentPassword = "wrong", NewPassword = "newpassword1" }));

        Assert.Equal("auth.invalid_credentials", exception.ErrorCode);
        _userRepository.Verify(r => r.Update(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_CorrectPasswordAndForcedChange_ReturnsNewTokenAndUpdatesUser()
    {
        var user = User.Create("USER01", "cashier1", "hash", Role.Cashier, mustChangePassword: true);
        _userRepository.Setup(r => r.GetById("USER01")).ReturnsAsync(user);
        _passwordHasher.Setup(h => h.Verify("hash", "correct")).Returns(true);
        _passwordHasher.Setup(h => h.Hash("newpassword1")).Returns("new-hash");
        _tokenIssuer.Setup(t => t.IssueAccessToken(user, It.IsAny<DateTime>())).Returns("fresh-token");
        var sut = CreateSut();

        var token = await sut.Handle(
            new ChangePasswordCommand { UserId = "USER01", CurrentPassword = "correct", NewPassword = "newpassword1" });

        Assert.Equal("fresh-token", token);
        Assert.False(user.MustChangePassword);
        _userRepository.Verify(r => r.Update(user), Times.Once);
    }

    [Fact]
    public async Task Handle_CorrectPasswordAndVoluntaryChange_ReturnsNull()
    {
        var user = User.Create("USER01", "cashier1", "hash", Role.Cashier, mustChangePassword: false);
        _userRepository.Setup(r => r.GetById("USER01")).ReturnsAsync(user);
        _passwordHasher.Setup(h => h.Verify("hash", "correct")).Returns(true);
        _passwordHasher.Setup(h => h.Hash("newpassword1")).Returns("new-hash");
        var sut = CreateSut();

        var token = await sut.Handle(
            new ChangePasswordCommand { UserId = "USER01", CurrentPassword = "correct", NewPassword = "newpassword1" });

        Assert.Null(token);
        _userRepository.Verify(r => r.Update(user), Times.Once);
        _tokenIssuer.Verify(t => t.IssueAccessToken(It.IsAny<User>(), It.IsAny<DateTime>()), Times.Never);
    }
}
