using Bazaar.Application.Users;
using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Moq;

namespace Bazaar.Application.UnitTests.Users;

public class UpdateUserHandlerTests
{
    private readonly Mock<IUserRepository> _userRepository = new();
    private readonly Mock<IPasswordHasher> _passwordHasher = new();

    private UpdateUserHandler CreateSut() =>
        new(_userRepository.Object, _passwordHasher.Object);

    [Fact]
    public async Task Handle_UnknownId_ThrowsNotFoundWithUserNotFoundCode()
    {
        _userRepository.Setup(r => r.GetById("USER001")).ReturnsAsync((User?)null);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<NotFoundException>(() => sut.Handle(
            new UpdateUserCommand { Id = "USER001", Role = Role.Admin }));

        Assert.Equal("user.not_found", exception.ErrorCode);
    }

    [Fact]
    public async Task Handle_DemoteOneOfTwoAdmins_Succeeds()
    {
        var user = User.Create("USER001", "admin1", "hash", Role.Admin, mustChangePassword: false);
        _userRepository.Setup(r => r.GetById("USER001")).ReturnsAsync(user);
        _userRepository.Setup(r => r.CountByRole(Role.Admin)).ReturnsAsync(2);
        var sut = CreateSut();

        await sut.Handle(new UpdateUserCommand { Id = "USER001", Role = Role.Cashier });

        Assert.Equal(Role.Cashier, user.Role);
        _userRepository.Verify(r => r.Update(user), Times.Once);
    }

    [Fact]
    public async Task Handle_DemoteSoleRemainingAdmin_ThrowsConflictWithLastAdminCode()
    {
        var user = User.Create("USER001", "admin1", "hash", Role.Admin, mustChangePassword: false);
        _userRepository.Setup(r => r.GetById("USER001")).ReturnsAsync(user);
        _userRepository.Setup(r => r.CountByRole(Role.Admin)).ReturnsAsync(1);
        var sut = CreateSut();

        var exception = await Assert.ThrowsAsync<ConflictException>(() => sut.Handle(
            new UpdateUserCommand { Id = "USER001", Role = Role.Cashier }));

        Assert.Equal("user.last_admin", exception.ErrorCode);
        Assert.Equal(Role.Admin, user.Role);
        _userRepository.Verify(r => r.Update(It.IsAny<User>()), Times.Never);
    }

    [Fact]
    public async Task Handle_PromoteCashierToAdmin_NeverTripsLastAdminGuard()
    {
        var user = User.Create("USER001", "kasse1", "hash", Role.Cashier, mustChangePassword: false);
        _userRepository.Setup(r => r.GetById("USER001")).ReturnsAsync(user);
        _userRepository.Setup(r => r.CountByRole(Role.Admin)).ReturnsAsync(1);
        var sut = CreateSut();

        await sut.Handle(new UpdateUserCommand { Id = "USER001", Role = Role.Admin });

        Assert.Equal(Role.Admin, user.Role);
        _userRepository.Verify(r => r.Update(user), Times.Once);
    }

    [Fact]
    public async Task Handle_SoleAdminRoleSetToAdminAgain_NeverTripsLastAdminGuard()
    {
        var user = User.Create("USER001", "admin1", "hash", Role.Admin, mustChangePassword: false);
        _userRepository.Setup(r => r.GetById("USER001")).ReturnsAsync(user);
        var sut = CreateSut();

        await sut.Handle(new UpdateUserCommand { Id = "USER001", Role = Role.Admin });

        Assert.Equal(Role.Admin, user.Role);
        _userRepository.Verify(r => r.CountByRole(It.IsAny<Role>()), Times.Never);
        _userRepository.Verify(r => r.Update(user), Times.Once);
    }

    [Fact]
    public async Task Handle_PasswordReset_SetsMustChangePasswordTrue()
    {
        var user = User.Create("USER001", "kasse1", "hash", Role.Cashier, mustChangePassword: false);
        _userRepository.Setup(r => r.GetById("USER001")).ReturnsAsync(user);
        _passwordHasher.Setup(h => h.Hash("newpassword1")).Returns("hashed-newpassword1");
        var sut = CreateSut();

        await sut.Handle(new UpdateUserCommand { Id = "USER001", NewPassword = "newpassword1" });

        Assert.Equal("hashed-newpassword1", user.PasswordHash);
        Assert.True(user.MustChangePassword);
        _userRepository.Verify(r => r.Update(user), Times.Once);
    }
}
