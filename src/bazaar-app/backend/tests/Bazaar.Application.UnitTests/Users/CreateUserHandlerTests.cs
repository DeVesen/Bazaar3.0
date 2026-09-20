using Bazaar.Application.Users;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Moq;

namespace Bazaar.Application.UnitTests.Users;

public class CreateUserHandlerTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();

    private CreateUserHandler CreateSut() =>
        new(_userRepository.Object, _passwordHasher.Object, _idGenerator.Object);

    [Fact]
    public async Task Handle_UsernameAvailable_CreatesUserWithMustChangePasswordTrue()
    {
        _userRepository.Setup(r => r.GetByUsername("kasse2")).ReturnsAsync((User?)null);
        _idGenerator.Setup(g => g.Generate()).Returns("USER001");
        _passwordHasher.Setup(h => h.Hash("password1")).Returns("hashed-password1");
        var sut = CreateSut();

        var user = await sut.Handle(new CreateUserCommand { Username = "  kasse2  ", Role = Role.Cashier, InitialPassword = "password1" });

        Assert.Equal("USER001", user.Id);
        Assert.Equal("kasse2", user.Username);
        Assert.Equal("hashed-password1", user.PasswordHash);
        Assert.Equal(Role.Cashier, user.Role);
        Assert.True(user.MustChangePassword);
        _userRepository.Verify(r => r.Add(It.Is<User>(u => u.Id == "USER001" && u.Username == "kasse2")), Times.Once);
    }

    [Theory]
    [InlineData("kasse2")]
    [InlineData("KASSE2")]
    [InlineData("  kasse2  ")]
    public async Task Handle_DuplicateUsername_ThrowsConflictWithUsernameTakenCode(string username)
    {
        _userRepository.Setup(r => r.GetByUsername(username.Trim())).ReturnsAsync(
            User.Create("existing", "kasse2", "hash", Role.Cashier, mustChangePassword: false));
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(
            new CreateUserCommand { Username = username, Role = Role.Cashier, InitialPassword = "password1" }));

        Assert.Equal("user.username_taken", exception.ErrorCode);
        _userRepository.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }
}
