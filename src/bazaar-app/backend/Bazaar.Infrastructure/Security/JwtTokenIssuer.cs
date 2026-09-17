using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;

namespace Bazaar.Infrastructure.Security;

public sealed class JwtTokenIssuer(IOptions<JwtOptions> options) : ITokenIssuer
{
    public string IssueAccessToken(User user, DateTime nowUtc)
    {
        var opts = options.Value;
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(opts.SigningKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        // Literal claim types "sub"/"name"/"role"/"mustChangePassword" instead of
        // ASP.NET's standard URIs, so the frontend (jwt-decoder.ts) can read the
        // payload without mapping.
        var claims = new[]
        {
            new Claim("sub", user.Id),
            new Claim("name", user.Username),
            new Claim("role", user.Role == Role.Admin ? "admin" : "cashier"),
            new Claim("mustChangePassword", user.MustChangePassword ? "true" : "false", ClaimValueTypes.Boolean),
        };

        var token = new JwtSecurityToken(
            issuer: opts.Issuer,
            audience: opts.Audience,
            claims: claims,
            notBefore: nowUtc,
            expires: nowUtc.Add(opts.AccessTokenLifetime),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}
