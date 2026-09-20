using Bazaar.Domain.Users;

namespace Bazaar.Application.Users;

/// <summary>
/// Single source of truth for the "last admin" rule: an admin user must not
/// be demoted or deleted if they are the last remaining admin. Used by
/// UpdateUserHandler and DeleteUserHandler.
/// </summary>
public static class LastAdminGuard
{
    public static bool IsLastRemainingAdmin(User user, int adminCount) =>
        user.Role == Role.Admin && adminCount <= 1;
}
