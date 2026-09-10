namespace BAR.Application.Settings;

public sealed record SettingsResult(
    DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil,
    DateTime? BazaarFrom, DateTime? BazaarUntil, string? DefaultTypeId, string? InfoText,
    int? StartNumber, int? BlockSize, int? DefaultBlockCount);
