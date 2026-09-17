namespace Bazaar.Application.Auth;

/// <summary>
/// Bound directly from the JSON request body of POST /api/auth/login
/// ({ "username": "...", "password": "..." }) — no separate input DTO,
/// see task-B3-brief.md.
/// </summary>
public sealed class LoginCommand
{
    public string Username { get; set; } = string.Empty;

    public string Password { get; set; } = string.Empty;
}
