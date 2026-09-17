namespace Bazaar.Application.Auth;

/// <summary>
/// <see cref="CurrentPassword"/>/<see cref="NewPassword"/> are bound directly from the
/// JSON request body of PUT /api/auth/password. <see cref="UserId"/> is NOT part of the
/// wire contract — the endpoint sets it from the authenticated caller's "sub" claim
/// after ASP.NET model binding (and after the ValidationFilter has already run).
/// </summary>
public sealed class ChangePasswordCommand
{
    public string UserId { get; set; } = string.Empty;

    public string CurrentPassword { get; set; } = string.Empty;

    public string NewPassword { get; set; } = string.Empty;
}
