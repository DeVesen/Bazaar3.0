namespace BAR.Modules.SellerManagement.Contracts.Security;

/// <summary>
/// Lives in Contracts (not Infrastructure) because BAR.Host needs the same
/// values for the JWT bearer middleware (token validation) without reaching
/// into the module's internals - a plain configuration DTO, no logic.
/// </summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public required string SigningKey { get; init; }
    public string Issuer { get; init; } = "bar-advance-registration";
    public TimeSpan AccessTokenLifetime { get; init; } = TimeSpan.FromDays(5);
    public TimeSpan RefreshTokenLifetime { get; init; } = TimeSpan.FromDays(30);
}
