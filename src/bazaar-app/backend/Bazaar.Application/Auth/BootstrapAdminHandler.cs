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
        // Serializes concurrent bootstrap attempts within this process: only one
        // check-and-create can run at a time, so two requests racing on an empty DB
        // can no longer both pass the check before either writes. The in-memory flag
        // is checked first (cheap), the DB is rechecked second (authoritative for
        // state this process didn't itself create, e.g. after a restart).
        using var _ = await bootstrapState.AcquireBootstrapLockAsync();

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
