using Bazaar.Application.Users;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Moq;

namespace Bazaar.Application.UnitTests.Users;

public class DeleteUserHandlerTests
{
    private readonly Mock<IUserRepository> _userRepository = new();

    private DeleteUserHandler CreateSut() => new(_userRepository.Object);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithUserNotFoundCode()
    {
        _userRepository.Setup(r => r.GetById("USER001")).ReturnsAsync((User?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle("USER001"));

        Assert.Equal("user.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_NotLastAdmin_RemovesUser()
    {
        var user = User.Create("USER001", "kasse1", "hash", Role.Cashier, mustChangePassword: false);
        _userRepository.Setup(r => r.GetById("USER001")).ReturnsAsync(user);
        _userRepository.Setup(r => r.CountByRole(Role.Admin)).ReturnsAsync(2);
        var sut = CreateSut();

        await sut.Handle("USER001");

        _userRepository.Verify(r => r.Remove(user), Times.Once);
    }

    [Fact]
    public async Task Handle_SoleRemainingAdmin_ThrowsConflictWithLastAdminCode()
    {
        var user = User.Create("USER001", "admin1", "hash", Role.Admin, mustChangePassword: false);
        _userRepository.Setup(r => r.GetById("USER001")).ReturnsAsync(user);
        _userRepository.Setup(r => r.CountByRole(Role.Admin)).ReturnsAsync(1);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle("USER001"));

        Assert.Equal("user.last_admin", exception.ErrorCode);
        _userRepository.Verify(r => r.Remove(It.IsAny<User>()), Times.Never);
    }
}
