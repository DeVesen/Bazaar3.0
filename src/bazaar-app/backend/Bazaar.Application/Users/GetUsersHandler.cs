using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;

namespace Bazaar.Application.Users;

public sealed record UserListItem(string Id, string Username, Role Role, bool MustChangePassword);

public sealed class GetUsersHandler(IUserRepository userRepository)
{
    public async Task<IReadOnlyList<UserListItem>> Handle()
    {
        var users = await userRepository.GetAll();
        return users
            .OrderBy(u => u.Username, StringComparer.OrdinalIgnoreCase)
            .Select(u => new UserListItem(u.Id, u.Username, u.Role, u.MustChangePassword))
            .ToList();
    }
}
