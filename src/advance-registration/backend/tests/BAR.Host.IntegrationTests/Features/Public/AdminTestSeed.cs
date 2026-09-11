using BAR.Modules.Verkaeuferverwaltung.Application.Abstractions;
using BAR.Modules.Verkaeuferverwaltung.Domain.Ports;
using BAR.Modules.Verkaeuferverwaltung.Domain.Sellers;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Public;

/// <summary>
/// Es gibt seit dem Wegfall des rohen SQL-Datenseeds (dieselbe Aenderung, die
/// RegistrationTestSeed fuer Settings dokumentiert - der alte, migrationsseitig
/// fest eingebettete Admin-Account "admin@bazaar.local" existiert nicht mehr)
/// keinen vorbelegten Admin-Account mehr. Bestehende Endpoint-Tests nutzen
/// diesen Account nur als Setup, um an ein Admin-Token zu kommen; sie legen ihn
/// jetzt selbst an, bevor sie sich einloggen. SellerTypeId ist ein reiner
/// String ohne Cross-Schema-FK (Stammdaten liegt in einem anderen Schema) -
/// jeder 8-stellige Platzhalter ist gueltig.
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
