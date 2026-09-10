namespace BAR.Application.Profile.ChangePassword;

public sealed record ChangePasswordCommand(string CurrentPassword, string NewPassword, string NewPasswordConfirmation);
