using Bazaar.Domain.Exceptions;
using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;

namespace Bazaar.Application.Users;

public sealed class CreateUserHandler(IUserRepository userRepository, IPasswordHasher passwordHasher, IIdGenerator idGenerator)
{
    public async Task<User> Handle(CreateUserCommand command)
    {
        var trimmedUsername = command.Username.Trim();

        if (await userRepository.GetByUsername(trimmedUsername) is not null)
        {
            throw new ConflictException("Benutzername bereits vergeben", "user.username_taken");
        }

        var user = User.Create(
            idGenerator.Generate(),
            trimmedUsername,
            passwordHasher.Hash(command.InitialPassword),
            command.Role,
            mustChangePassword: true);

        await userRepository.Add(user);
        return user;
    }
}
