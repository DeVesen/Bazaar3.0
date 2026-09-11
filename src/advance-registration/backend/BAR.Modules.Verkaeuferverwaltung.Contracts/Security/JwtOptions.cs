namespace BAR.Modules.Verkaeuferverwaltung.Contracts.Security;

/// <summary>
/// Liegt in Contracts (nicht Infrastructure), weil BAR.Host dieselben Werte
/// fuer die JWT-Bearer-Middleware braucht (Token-Validierung), ohne das Modul
/// in seinen Internas anzusprechen - eine reine Konfigurations-DTO, keine Logik.
/// </summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public required string SigningKey { get; init; }
    public string Issuer { get; init; } = "bar-advance-registration";
    public TimeSpan AccessTokenLifetime { get; init; } = TimeSpan.FromDays(5);
    public TimeSpan RefreshTokenLifetime { get; init; } = TimeSpan.FromDays(30);
}
