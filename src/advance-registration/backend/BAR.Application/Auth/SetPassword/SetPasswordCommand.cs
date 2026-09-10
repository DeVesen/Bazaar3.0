namespace BAR.Application.Auth.SetPassword;

public sealed record SetPasswordCommand(string InviteToken, string Password);
