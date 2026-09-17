namespace Bazaar.Infrastructure.Security;

public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public required string SigningKey { get; init; }
    public TimeSpan AccessTokenLifetime { get; init; } = TimeSpan.FromHours(16);
}
