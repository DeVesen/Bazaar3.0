namespace Bazaar.Application.UnitTests.Auth;

using Bazaar.Application.Auth;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Moq;

public class BootstrapAdminHandlerTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();
    private readonly Mock<IIdGenerator> _idGenerator = new();
    private readonly Mock<ITokenIssuer> _tokenIssuer = new();
    private readonly AdminBootstrapState _state = new();

    private BootstrapAdminHandler CreateSut() =>
        new(_userRepository.Object, _passwordHasher.Object, _idGenerator.Object, _tokenIssuer.Object, _state);

    [Fact]
    public async Task Handle_StateAlreadyHasAdmin_ThrowsConflictWithoutTouchingRepository()
    {
        _state.Initialize(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(
            () => sut.Handle(new BootstrapAdminCommand { Username = "admin", Password = "changeme1" }));

        Assert.Equal("bootstrap.already_done", exception.ErrorCode);
        _userRepository.Verify(r => r.AnyAsync(), Times.Never);
        _userRepository.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_StateSaysNoAdminButDbHasOne_ThrowsConflict()
    {
        _state.Initialize(false);
        _userRepository.Setup(r => r.AnyAsync()).ReturnsAsync(true);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(
            () => sut.Handle(new BootstrapAdminCommand { Username = "admin", Password = "changeme1" }));

        Assert.Equal("bootstrap.already_done", exception.ErrorCode);
        _userRepository.Verify(r => r.Add(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_NoAdminYet_CreatesAdminWithoutMustChangePasswordAndReturnsToken()
    {
        _state.Initialize(false);
        _userRepository.Setup(r => r.AnyAsync()).ReturnsAsync(false);
        _passwordHasher.Setup(h => h.Hash("changeme1")).Returns("hashed-password");
        _idGenerator.Setup(g => g.Generate()).Returns("ADMIN001");
        User? addedUser = null;
        _userRepository
            .Setup(r => r.Add(It.IsAny<User>()))
            .Callback<User>(u => addedUser = u)
            .Returns(Task.CompletedTask);
        _tokenIssuer.Setup(t => t.IssueAccessToken(It.IsAny<User>(), It.IsAny<DateTime>())).Returns("issued-token");
        var sut = CreateSut();

        var token = await sut.Handle(new BootstrapAdminCommand { Username = "  admin  ", Password = "changeme1" });

        Assert.Equal("issued-token", token);
        Assert.NotNull(addedUser);
        Assert.Equal("ADMIN001", addedUser!.Id);
        Assert.Equal("admin", addedUser.Username);
        Assert.Equal("hashed-password", addedUser.PasswordHash);
        Assert.Equal(Role.Admin, addedUser.Role);
        Assert.False(addedUser.MustChangePassword);
        Assert.True(_state.HasAdmin);
    }
}
