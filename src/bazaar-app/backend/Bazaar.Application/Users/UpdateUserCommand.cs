using Bazaar.Domain.Users;

namespace Bazaar.Application.Users;

/// <summary>
/// <see cref="NewRole"/>/<see cref="NewPassword"/> are bound directly from the JSON request
/// body of PUT /api/users/{id}, both optional — at least one must be set. <see cref="Id"/> is
/// NOT part of the wire contract — the endpoint sets it from the route value after ASP.NET
/// model binding.
/// </summary>
public sealed class UpdateUserCommand
{
    public string Id { get; set; } = string.Empty; // set by the endpoint from the route value
    public Role? NewRole { get; set; }
    public string? NewPassword { get; set; }
}
