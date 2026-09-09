namespace BAR.Application.Public.GetInfo;

public sealed record ConditionsResult(decimal CommissionRate, decimal ItemFee);

public sealed record PublicInfoResult(
    DateTime? RegistrationDeadline, DateTime? DropOffFrom, DateTime? DropOffUntil,
    DateTime? BazaarFrom, DateTime? BazaarUntil, ConditionsResult? DefaultConditions, string? InfoText);
