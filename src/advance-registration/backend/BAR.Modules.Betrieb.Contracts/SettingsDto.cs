namespace BAR.Modules.Betrieb.Contracts;

public sealed record SettingsDto(
    DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil,
    DateTime? BazaarFrom, DateTime? BazaarUntil, string? DefaultTypeId, string? InfoText,
    int StartNumber, int BlockSize, int DefaultBlockCount);

public sealed record UpdateSettingsCommand(
    DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil,
    DateTime? BazaarFrom, DateTime? BazaarUntil, string? DefaultTypeId, string? InfoText,
    int StartNumber, int BlockSize, int DefaultBlockCount);

public sealed record ConditionsDto(decimal CommissionRate, decimal ItemFee);

public sealed record PublicInfoDto(
    DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil,
    DateTime? BazaarFrom, DateTime? BazaarUntil, ConditionsDto? DefaultConditions, string? InfoText);

/// <summary>Fuer Anmeldung: Nummernkreis-Konfiguration ohne Kenntnis der Settings-Domaene.</summary>
public sealed record NumberingConfigDto(int StartNumber, int BlockSize, int DefaultBlockCount);

/// <summary>Fuer Home (Host-Komposition): Basar-Termine fuer Countdown/KPIs.</summary>
public sealed record BazaarScheduleDto(DateTime? BazaarFrom, DateTime? BazaarUntil);
