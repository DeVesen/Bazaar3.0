using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Auth;

public sealed class LoginHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, ITokenIssuer tokenIssuer)
{
    public async Task<string> Handle(LoginCommand command)
    {
        var user = await userRepository.GetByUsername(command.Username);

        // Single throw site for both "user not found" and "password wrong" —
        // separate exceptions/messages would leak which one was wrong.
        if (user is null || !passwordHasher.Verify(user.PasswordHash, command.Password))
        {
            throw new UnauthorizedException("Ungültige Anmeldedaten", "auth.invalid_credentials");
        }

        return tokenIssuer.IssueAccessToken(user, DateTime.UtcNow);
    }
}
