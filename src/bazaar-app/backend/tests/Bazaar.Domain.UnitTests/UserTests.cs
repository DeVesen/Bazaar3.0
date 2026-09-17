using Bazaar.Domain.Users;

namespace Bazaar.Domain.UnitTests;

public class UserTests
{
    [Theory]
    [InlineData("")]
    [InlineData("   ")]
    public void Create_WithEmptyOrWhitespaceUsername_Throws(string username)
    {
        Assert.Throws<ArgumentException>(() =>
            User.Create("user-1", username, "hash", Role.Cashier, mustChangePassword: false));
    }

    [Theory]
    [InlineData(Role.Admin, true)]
    [InlineData(Role.Admin, false)]
    [InlineData(Role.Cashier, true)]
    [InlineData(Role.Cashier, false)]
    public void Create_WithValidData_SetsAllProperties(Role role, bool mustChangePassword)
    {
        var user = User.Create("user-1", "alice", "hashed-password", role, mustChangePassword);

        Assert.Equal("user-1", user.Id);
        Assert.Equal("alice", user.Username);
        Assert.Equal("hashed-password", user.PasswordHash);
        Assert.Equal(role, user.Role);
        Assert.Equal(mustChangePassword, user.MustChangePassword);
    }

    [Fact]
    public void ChangePassword_WhenMustChangePasswordWasTrue_UpdatesHashAndClearsFlag()
    {
        var user = User.Create("user-1", "alice", "old-hash", Role.Cashier, mustChangePassword: true);

        user.ChangePassword("new-hash");

        Assert.Equal("new-hash", user.PasswordHash);
        Assert.False(user.MustChangePassword);
    }

    [Fact]
    public void ChangePassword_WhenMustChangePasswordWasFalse_UpdatesHashAndStaysFalse()
    {
        var user = User.Create("user-1", "alice", "old-hash", Role.Cashier, mustChangePassword: false);

        user.ChangePassword("new-hash");

        Assert.Equal("new-hash", user.PasswordHash);
        Assert.False(user.MustChangePassword);
    }
}
