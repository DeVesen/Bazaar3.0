namespace BAR.Modules.Operations.Contracts;

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

/// <summary>For Registration: numbering-range configuration without knowledge of the Settings domain.</summary>
public sealed record NumberingConfigDto(int StartNumber, int BlockSize, int DefaultBlockCount);

/// <summary>For Home (Host composition): bazaar dates for the countdown/KPIs.</summary>
public sealed record BazaarScheduleDto(DateTime? BazaarFrom, DateTime? BazaarUntil);
