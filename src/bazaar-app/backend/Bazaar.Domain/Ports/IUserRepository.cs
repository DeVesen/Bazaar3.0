using Bazaar.Domain.Users;

namespace Bazaar.Domain.Ports;

public interface IUserRepository
{
    Task Add(User user);

    Task<User?> GetById(string id);

    /// <summary>
    /// Case-insensitive lookup by username. Case-insensitivity is the
    /// implementation's responsibility (e.g. Postgres citext column).
    /// </summary>
    Task<User?> GetByUsername(string username);

    Task Update(User user);

    /// <summary>
    /// Returns whether any user exists at all. Used by SeedAdminHostedService
    /// to decide whether the initial admin user needs to be seeded.
    /// </summary>
    Task<bool> AnyAsync();

    /// <summary>
    /// Counts users with the given role. Used to enforce the "last admin"
    /// rule when changing a user's role or deleting a user.
    /// </summary>
    Task<int> CountByRole(Role role);

    Task Remove(User user);

    /// <summary>
    /// Returns all users. Used by GetUsersHandler for the (non-paginated)
    /// user-management list.
    /// </summary>
    Task<IReadOnlyList<User>> GetAll();
}
