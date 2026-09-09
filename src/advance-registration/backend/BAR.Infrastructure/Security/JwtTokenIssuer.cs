using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using BAR.Application.Abstractions;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace BAR.Infrastructure.Security;

public sealed class JwtTokenIssuer(IOptions<JwtOptions> options) : ITokenIssuer
{
    public string IssueAccessToken(string sellerId, string role, DateTime nowUtc)
    {
        var opts = options.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Literale Claim-Typen "sub"/"role" statt ASP.NET-Standard-URIs, damit
        // das Frontend (jwt-decoder.ts) die Payload ohne Mapping lesen kann.
        var claims = new[]
        {
            new Claim("sub", sellerId),
            new Claim("role", role)
        };

        var token = new JwtSecurityToken(
            issuer: opts.Issuer,
            claims: claims,
            notBefore: nowUtc,
            expires: nowUtc.Add(opts.AccessTokenLifetime),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    public string GenerateRefreshTokenPlainText() =>
        Convert.ToHexStringLower(RandomNumberGenerator.GetBytes(32));
}
