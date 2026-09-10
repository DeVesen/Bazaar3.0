namespace BAR.Application.Profile.ChangeEmail;

public sealed record ChangeEmailCommand(string NewEmail, string CurrentPassword);
