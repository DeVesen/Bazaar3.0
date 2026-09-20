using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;

namespace Bazaar.Application.Auth;

public sealed class BootstrapAdminHandler(
    IUserRepository userRepository,
    IPasswordHasher passwordHasher,
    IIdGenerator idGenerator,
    ITokenIssuer tokenIssuer,
    AdminBootstrapState bootstrapState)
{
    public async Task<string> Handle(BootstrapAdminCommand command)
    {
        // Fast in-memory check first, DB recheck second - closes the race window
        // between two concurrent first requests without hitting the DB on every call.
        if (bootstrapState.HasAdmin || await userRepository.AnyAsync())
        {
            throw new ConflictException("Setup wurde bereits abgeschlossen", "bootstrap.already_done");
        }

        var passwordHash = passwordHasher.Hash(command.Password);
        var admin = User.Create(idGenerator.Generate(), command.Username.Trim(), passwordHash, Role.Admin, mustChangePassword: false);
        await userRepository.Add(admin);
        bootstrapState.MarkAdminCreated();

        return tokenIssuer.IssueAccessToken(admin, DateTime.UtcNow);
    }
}
