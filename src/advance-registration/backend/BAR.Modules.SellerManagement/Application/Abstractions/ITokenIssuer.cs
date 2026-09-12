namespace BAR.Modules.SellerManagement.Application.Abstractions;

public interface ITokenIssuer
{
    /// <summary>A JWT with sub/role/exp claims (auth.md) - the lifetime is up to the adapter.</summary>
    string IssueAccessToken(string sellerId, string role, DateTime nowUtc);

    /// <summary>A cryptographically random plaintext refresh token; the caller hashes it via RefreshToken.HashOf before storing it.</summary>
    string GenerateRefreshTokenPlainText();
}
