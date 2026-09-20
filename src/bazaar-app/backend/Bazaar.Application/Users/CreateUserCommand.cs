using Bazaar.Domain.Users;

namespace Bazaar.Application.Users;

/// <summary>
/// All three fields are bound directly from the JSON request body of POST /api/users.
/// </summary>
public sealed class CreateUserCommand
{
    public string Username { get; set; } = string.Empty;
    public Role Role { get; set; }
    public string InitialPassword { get; set; } = string.Empty;
}
