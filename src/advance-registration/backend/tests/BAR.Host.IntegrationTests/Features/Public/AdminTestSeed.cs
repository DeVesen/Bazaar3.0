using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Public;

/// <summary>
/// No admin is pre-seeded in the database (the hardcoded migration seed was
/// removed in favor of the runtime bootstrap-admin flow, BootstrapAdminCommandHandler).
/// Endpoint tests that need an admin token create one directly through this
/// helper rather than going through /api/auth/bootstrap-admin, since most of
/// them share a database with other tests where an admin already exists.
/// SellerTypeId is a plain string with no cross-schema FK (MasterData lives
/// in a different schema) - any 8-character placeholder is valid.
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
