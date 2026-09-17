using System.Text;
using System.Text.Json;
using Bazaar.Domain.Users;
using Bazaar.Infrastructure.Security;
using Microsoft.Extensions.Options;

namespace Bazaar.Infrastructure.UnitTests.Security;

public class JwtTokenIssuerTests
{
    private readonly JwtOptions _options = new()
    {
        Issuer = "bazaar-app-tests",
        Audience = "bazaar-app-tests",
        SigningKey = "unit-test-signing-key-not-for-production-use-12345",
    };

    private JwtTokenIssuer CreateSut() => new(Options.Create(_options));

    [Fact]
    public void IssueAccessToken_contains_expected_claims()
    {
        var sut = CreateSut();
        var user = User.Create("ABCD1234", "cashier1", "hash", Role.Cashier, mustChangePassword: false);
        var nowUtc = DateTime.UtcNow;

        var token = sut.IssueAccessToken(user, nowUtc);
        var payload = DecodePayload(token);

        Assert.Equal("ABCD1234", payload.GetProperty("sub").GetString());
        Assert.Equal("cashier1", payload.GetProperty("name").GetString());
        Assert.Equal("cashier", payload.GetProperty("role").GetString());
        Assert.Equal(_options.Issuer, payload.GetProperty("iss").GetString());
        Assert.Equal(_options.Audience, payload.GetProperty("aud").GetString());
    }

    [Fact]
    public void IssueAccessToken_maps_admin_role_to_lowercase_admin()
    {
        var sut = CreateSut();
        var user = User.Create("ABCD1234", "admin1", "hash", Role.Admin, mustChangePassword: false);

        var token = sut.IssueAccessToken(user, DateTime.UtcNow);
        var payload = DecodePayload(token);

        Assert.Equal("admin", payload.GetProperty("role").GetString());
    }

    [Fact]
    public void IssueAccessToken_serializes_mustChangePassword_as_a_json_boolean_not_a_string()
    {
        var sut = CreateSut();
        var user = User.Create("ABCD1234", "admin1", "hash", Role.Admin, mustChangePassword: true);

        var token = sut.IssueAccessToken(user, DateTime.UtcNow);
        var payload = DecodePayload(token);

        var claim = payload.GetProperty("mustChangePassword");
        Assert.True(claim.ValueKind is JsonValueKind.True or JsonValueKind.False);
        Assert.Equal(JsonValueKind.True, claim.ValueKind);
    }

    [Fact]
    public void IssueAccessToken_serializes_mustChangePassword_false_as_json_false()
    {
        var sut = CreateSut();
        var user = User.Create("ABCD1234", "cashier1", "hash", Role.Cashier, mustChangePassword: false);

        var token = sut.IssueAccessToken(user, DateTime.UtcNow);
        var payload = DecodePayload(token);

        var claim = payload.GetProperty("mustChangePassword");
        Assert.Equal(JsonValueKind.False, claim.ValueKind);
    }

    [Fact]
    public void IssueAccessToken_sets_expiry_based_on_configured_lifetime()
    {
        var sut = CreateSut();
        var user = User.Create("ABCD1234", "cashier1", "hash", Role.Cashier, mustChangePassword: false);
        var nowUtc = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        var token = sut.IssueAccessToken(user, nowUtc);
        var payload = DecodePayload(token);

        var expectedExpiry = new DateTimeOffset(nowUtc.Add(_options.AccessTokenLifetime)).ToUnixTimeSeconds();
        Assert.Equal(expectedExpiry, payload.GetProperty("exp").GetInt64());
    }

    private static JsonElement DecodePayload(string jwt)
    {
        var segments = jwt.Split('.');
        var payloadSegment = segments[1];

        var padded = payloadSegment.PadRight(payloadSegment.Length + (4 - payloadSegment.Length % 4) % 4, '=');
        var base64 = padded.Replace('-', '+').Replace('_', '/');
        var json = Encoding.UTF8.GetString(Convert.FromBase64String(base64));

        return JsonSerializer.Deserialize<JsonElement>(json);
    }
}
