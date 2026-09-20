using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;

namespace Bazaar.Application.Users;

public sealed class UpdateUserHandler(IUserRepository userRepository, IPasswordHasher passwordHasher)
{
    public async Task Handle(UpdateUserCommand command)
    {
        var user = await userRepository.GetById(command.Id)
            ?? throw new NotFoundException("Benutzer nicht gefunden", "user.not_found");

        if (command.Role is not null && command.Role.Value != user.Role)
        {
            var adminCount = await userRepository.CountByRole(Role.Admin);
            if (LastAdminGuard.IsLastRemainingAdmin(user, adminCount) && command.Role.Value != Role.Admin)
            {
                throw new ConflictException("Das letzte Admin-Konto kann seine Rolle nicht verlieren", "user.last_admin");
            }

            user.ChangeRole(command.Role.Value);
        }

        if (!string.IsNullOrEmpty(command.NewPassword))
        {
            user.ResetPassword(passwordHasher.Hash(command.NewPassword));
        }

        await userRepository.Update(user);
    }
}
