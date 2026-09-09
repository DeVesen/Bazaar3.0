using System.IdentityModel.Tokens.Jwt;
using BAR.Application.Abstractions;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Security;

public class SecurityAdaptersTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SecurityAdaptersTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public void PasswordHasher_HashThenVerify_Succeeds()
    {
        using var scope = _factory.Services.CreateScope();
        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();

        var hash = hasher.Hash("Admin123!");

        Assert.NotEqual("Admin123!", hash);
        Assert.True(hasher.Verify("Admin123!", hash));
        Assert.False(hasher.Verify("wrong", hash));
    }

    [Fact]
    public void TokenIssuer_IssueAccessToken_ContainsLiteralClaimNames()
    {
        using var scope = _factory.Services.CreateScope();
        var issuer = scope.ServiceProvider.GetRequiredService<ITokenIssuer>();

        var jwt = issuer.IssueAccessToken("a0000001", "admin", DateTime.UtcNow);
        var token = new JwtSecurityTokenHandler().ReadJwtToken(jwt);

        Assert.Equal("a0000001", token.Claims.Single(c => c.Type == "sub").Value);
        Assert.Equal("admin", token.Claims.Single(c => c.Type == "role").Value);
        Assert.NotNull(token.Claims.SingleOrDefault(c => c.Type == "exp"));
    }
}
