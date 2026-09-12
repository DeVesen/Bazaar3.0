using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Public;

/// <summary>
/// Since the raw SQL data seed was removed (the same change that
/// RegistrationTestSeed documents for settings - the old admin account
/// "admin@bazaar.local", hardcoded in the migration, no longer exists), there
/// is no longer a pre-seeded admin account. Existing endpoint tests use this
/// account only as setup to obtain an admin token; they now create it
/// themselves before logging in. SellerTypeId is a plain string with no
/// cross-schema FK (MasterData lives in a different schema) - any 8-character
/// placeholder is valid.
/// </summary>
public static class AdminTestSeed
{
    public static async Task EnsureAdminAsync(IServiceProvider services, string email, string password, CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();

        if (await sellers.GetByEmailAsync(email, cancellationToken) is not null)
        {
            return;
        }

        var hasher = scope.ServiceProvider.GetRequiredService<IPasswordHasher>();
        var admin = Seller.Register(
            "Admin", "User", null, "00000", "Ort", "0000000000",
            email, sellerTypeId: "a0000001", passwordHash: hasher.Hash(password), isAdmin: true);
        await sellers.AddAsync(admin, cancellationToken);
    }
}
