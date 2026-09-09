namespace BAR.Application.Abstractions;

public interface ITokenIssuer
{
    /// <summary>JWT mit Claims sub/role/exp (auth.md) - Lebensdauer liegt beim Adapter.</summary>
    string IssueAccessToken(string sellerId, string role, DateTime nowUtc);

    /// <summary>Kryptografisch zufaelliger Klartext-Refresh-Token; der Aufrufer hasht ihn ueber RefreshToken.HashOf vor dem Speichern.</summary>
    string GenerateRefreshTokenPlainText();
}
