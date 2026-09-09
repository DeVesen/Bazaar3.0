namespace BAR.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public required string SigningKey { get; init; }
    public string Issuer { get; init; } = "bar-advance-registration";
    public TimeSpan AccessTokenLifetime { get; init; } = TimeSpan.FromDays(5);
    public TimeSpan RefreshTokenLifetime { get; init; } = TimeSpan.FromDays(30);
}
