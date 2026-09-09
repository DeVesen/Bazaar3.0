using BAR.Domain.Auth;

namespace BAR.Domain.UnitTests.Auth;

public class RefreshTokenTests
{
    [Fact]
    public void Issue_ValidData_StoresOnlyHashNotPlainText()
    {
        var now = DateTime.UtcNow;
        var token = RefreshToken.Issue("a3f9c2d1", "plain-text-token", now, now.AddDays(30));

        Assert.Equal(8, token.Id.Length);
        Assert.Equal("a3f9c2d1", token.SellerId);
        Assert.NotEqual("plain-text-token", token.TokenHash);
        Assert.Equal(64, token.TokenHash.Length); // SHA-256 Hex
        Assert.Equal(now, token.CreatedAt);
        Assert.Equal(now.AddDays(30), token.ExpiresAt);
        Assert.Null(token.LastUsedAt);
    }

    [Fact]
    public void HashOf_SameInput_ReturnsSameHash()
    {
        Assert.Equal(RefreshToken.HashOf("abc"), RefreshToken.HashOf("abc"));
        Assert.NotEqual(RefreshToken.HashOf("abc"), RefreshToken.HashOf("xyz"));
    }
}
