using Bazaar.Application.Users;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Moq;

namespace Bazaar.Application.UnitTests.Users;

public class GetUsersHandlerTests
{
    private readonly Mock<IUserRepository> _userRepository = new();

    private GetUsersHandler CreateSut() => new(_userRepository.Object);

    [Fact]
    public async Task Handle_MultipleUsers_ReturnsOrderedByUsernameCaseInsensitive()
    {
        var anna = User.Create("user-1", "anna", "hash1", Role.Admin, mustChangePassword: false);
        var kasse1 = User.Create("user-2", "Kasse1", "hash2", Role.Cashier, mustChangePassword: true);
        var berta = User.Create("user-3", "berta", "hash3", Role.Cashier, mustChangePassword: false);
        _userRepository.Setup(r => r.GetAll()).ReturnsAsync([kasse1, anna, berta]);
        var sut = CreateSut();

        var result = await sut.Handle();

        Assert.Equal(["anna", "berta", "Kasse1"], result.Select(u => u.Username));
    }

    [Fact]
    public async Task Handle_ReturnsListItem_WithoutPasswordHashProperty()
    {
        var properties = typeof(UserListItem).GetProperties().Select(p => p.Name).OrderBy(n => n).ToArray();

        Assert.Equal(new[] { "Id", "MustChangePassword", "Role", "Username" }, properties);
    }

    [Fact]
    public async Task Handle_MapsFieldsCorrectly()
    {
        var user = User.Create("user-1", "anna", "hash1", Role.Admin, mustChangePassword: true);
        _userRepository.Setup(r => r.GetAll()).ReturnsAsync([user]);
        var sut = CreateSut();

        var result = await sut.Handle();

        var item = Assert.Single(result);
        Assert.Equal("user-1", item.Id);
        Assert.Equal("anna", item.Username);
        Assert.Equal(Role.Admin, item.Role);
        Assert.True(item.MustChangePassword);
    }
}
