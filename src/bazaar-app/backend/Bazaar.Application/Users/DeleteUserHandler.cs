using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;

namespace Bazaar.Application.Users;

public sealed class DeleteUserHandler(IUserRepository userRepository)
{
    public async Task Handle(string id)
    {
        var user = await userRepository.GetById(id)
            ?? throw new NotFoundException("Benutzer nicht gefunden", "user.not_found");

        var adminCount = await userRepository.CountByRole(Role.Admin);
        if (LastAdminGuard.IsLastRemainingAdmin(user, adminCount))
        {
            throw new ConflictException("Das letzte Admin-Konto kann nicht gelöscht werden", "user.last_admin");
        }

        await userRepository.Remove(user);
    }
}
