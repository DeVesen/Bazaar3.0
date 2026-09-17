using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;

namespace Bazaar.Application.Auth;

public sealed class ChangePasswordHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    ITokenIssuer tokenIssuer)
{
    /// <returns>
    /// A new access token (mustChangePassword already cleared) when the change was
    /// forced (200), or null when it was a voluntary change (204).
    /// </returns>
    public async Task<string?> Handle(ChangePasswordCommand command)
    {
        var user = await userRepository.GetById(command.UserId)
            ?? throw new UnauthorizedException("Ungültige Anmeldedaten", "auth.invalid_credentials");

        if (!passwordHasher.Verify(user.PasswordHash, command.CurrentPassword))
        {
            throw new UnauthorizedException("Ungültige Anmeldedaten", "auth.invalid_credentials");
        }

        // Capture BEFORE ChangePassword() clears the flag as a side effect.
        var wasForced = user.MustChangePassword;

        user.ChangePassword(passwordHasher.Hash(command.NewPassword));
        await userRepository.Update(user);

        return wasForced ? tokenIssuer.IssueAccessToken(user, DateTime.UtcNow) : null;
    }
}
