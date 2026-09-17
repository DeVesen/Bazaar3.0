using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Microsoft.AspNetCore.Identity;

namespace Bazaar.Infrastructure.Security;

public sealed class AspNetPasswordHasher : IPasswordHasher
{
    private readonly PasswordHasher<User> _hasher = new();

    public string Hash(string plain) => _hasher.HashPassword(default!, plain);

    public bool Verify(string hash, string plain) =>
        _hasher.VerifyHashedPassword(default!, hash, plain) != PasswordVerificationResult.Failed;
}
