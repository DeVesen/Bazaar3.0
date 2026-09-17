using Bazaar.Domain.Ports;
using Bazaar.Domain.Users;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace Bazaar.Infrastructure.Security;

/// <summary>
/// Seeds the initial admin user on first startup (no users exist yet).
/// Fails fast if SEED_ADMIN_USER/SEED_ADMIN_PASSWORD are not configured, so
/// the app never starts up without any admin access.
/// </summary>
public sealed class SeedAdminHostedService(IServiceScopeFactory scopeFactory) : IHostedService
{
    public async Task StartAsync(CancellationToken cancellationToken)
    {
        using var scope = scopeFactory.CreateScope();
        var userRepository = scope.ServiceProvider.GetRequiredService<IUserRepository>();
        var passwordHasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var idGenerator = scope.ServiceProvider.GetRequiredService<IIdGenerator>();
        var configuration = scope.ServiceProvider.GetRequiredService<IConfiguration>();

        if (await userRepository.AnyAsync())
        {
            return;
        }

        var seedUsername = configuration["SEED_ADMIN_USER"];
        var seedPassword = configuration["SEED_ADMIN_PASSWORD"];

        if (string.IsNullOrEmpty(seedUsername) || string.IsNullOrEmpty(seedPassword))
        {
            throw new InvalidOperationException(
                "SEED_ADMIN_USER and SEED_ADMIN_PASSWORD must be configured to seed the initial admin user.");
        }

        var passwordHash = passwordHasher.Hash(seedPassword);
        var id = idGenerator.Generate();
        var admin = User.Create(id, seedUsername, passwordHash, Role.Admin, mustChangePassword: true);

        await userRepository.Add(admin);
    }

    public Task StopAsync(CancellationToken cancellationToken) => Task.CompletedTask;
}
