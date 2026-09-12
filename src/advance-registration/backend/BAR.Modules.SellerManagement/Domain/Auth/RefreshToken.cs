using System.Security.Cryptography;
using System.Text;
using BAR.SharedKernel;

namespace BAR.Modules.SellerManagement.Domain.Auth;

public sealed class RefreshToken
{
    private RefreshToken() { }

    public string Id { get; private init; } = null!;
    public string SellerId { get; private init; } = null!;
    public string TokenHash { get; private init; } = null!;
    public DateTime ExpiresAt { get; private init; }
    public DateTime CreatedAt { get; private init; }
    public DateTime? LastUsedAt { get; private init; }

    public static RefreshToken Issue(string sellerId, string plainTextToken, DateTime issuedAtUtc, DateTime expiresAtUtc) =>
        new()
        {
            Id = EntityId.New(), SellerId = sellerId, TokenHash = HashOf(plainTextToken),
            CreatedAt = issuedAtUtc, ExpiresAt = expiresAtUtc
        };

    public static string HashOf(string plainTextToken)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(plainTextToken));
        return Convert.ToHexStringLower(bytes);
    }
}
