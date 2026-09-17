namespace Bazaar.Domain.Users;

public sealed class User
{
    public string Id { get; private init; } = null!;
    public string Username { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public Role Role { get; private set; }
    public bool MustChangePassword { get; private set; }

    public static User Create(string id, string username, string passwordHash, Role role, bool mustChangePassword)
    {
        if (string.IsNullOrWhiteSpace(username)) throw new ArgumentException("Username required.");
        return new User { Id = id, Username = username, PasswordHash = passwordHash, Role = role, MustChangePassword = mustChangePassword };
    }

    public void ChangePassword(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
        MustChangePassword = false;
    }
}
