using Bazaar.Domain.Users;

namespace Bazaar.Application.Users;

/// <summary>
/// <see cref="Role"/>/<see cref="NewPassword"/> are bound directly from the JSON request
/// body of PUT /api/users/{id}, both optional — at least one must be set. The wire key for
/// <see cref="Role"/> is "role" (api/users.md §3), not "newRole" — named <c>Role</c> here
/// (matching <see cref="CreateUserCommand.Role"/>) so it binds correctly under the app's
/// camelCase JSON conventions. <see cref="Id"/> is NOT part of the wire contract — the
/// endpoint sets it from the route value after ASP.NET model binding.
/// </summary>
public sealed class UpdateUserCommand
{
    public string Id { get; set; } = string.Empty; // set by the endpoint from the route value
    public Role? Role { get; set; }
    public string? NewPassword { get; set; }
}
