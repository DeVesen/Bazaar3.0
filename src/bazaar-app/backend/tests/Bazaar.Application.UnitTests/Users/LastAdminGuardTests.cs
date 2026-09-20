using Bazaar.Application.Users;
using Bazaar.Domain.Users;

namespace Bazaar.Application.UnitTests.Users;

public class LastAdminGuardTests
{
    [Fact]
    public void IsLastRemainingAdmin_AdminWithCountOne_ReturnsTrue()
    {
        var user = User.Create("user-1", "admin1", "hash", Role.Admin, mustChangePassword: false);

        Assert.True(LastAdminGuard.IsLastRemainingAdmin(user, adminCount: 1));
    }

    [Fact]
    public void IsLastRemainingAdmin_AdminWithCountTwo_ReturnsFalse()
    {
        var user = User.Create("user-1", "admin1", "hash", Role.Admin, mustChangePassword: false);

        Assert.False(LastAdminGuard.IsLastRemainingAdmin(user, adminCount: 2));
    }

    [Fact]
    public void IsLastRemainingAdmin_CashierWithCountOne_ReturnsFalse()
    {
        var user = User.Create("user-1", "cashier1", "hash", Role.Cashier, mustChangePassword: false);

        Assert.False(LastAdminGuard.IsLastRemainingAdmin(user, adminCount: 1));
    }

    [Fact]
    public void IsLastRemainingAdmin_AdminWithCountZero_ReturnsTrue()
    {
        var user = User.Create("user-1", "admin1", "hash", Role.Admin, mustChangePassword: false);

        Assert.True(LastAdminGuard.IsLastRemainingAdmin(user, adminCount: 0));
    }
}
