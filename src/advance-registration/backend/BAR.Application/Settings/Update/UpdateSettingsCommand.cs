namespace BAR.Application.Settings.Update;

public sealed record UpdateSettingsCommand(
    DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil,
    DateTime? BazaarFrom, DateTime? BazaarUntil, string? DefaultTypeId, string? InfoText,
    int StartNumber, int BlockSize, int DefaultBlockCount);
