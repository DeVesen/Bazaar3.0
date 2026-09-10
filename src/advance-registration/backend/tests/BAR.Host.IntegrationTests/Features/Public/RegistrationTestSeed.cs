using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Public;

/// <summary>
/// Seit R09 gibt es nach dem Deployment keine vorbelegte <c>settings</c>-Zeile mehr
/// (Normalzustand, siehe api/settings.md) - Registrierung ist dann korrekt mit
/// <c>409 registration.not_enabled</c> gesperrt (api/auth.md). Bestehende Integrationstests
/// fuer andere Features nutzen die Registrierung nur als Setup, um an einen authentifizierten
/// Verkaeufer zu kommen; sie muessen dafuer jetzt selbst einen minimalen, gueltigen
/// Settings-Datensatz anlegen.
/// </summary>
public static class RegistrationTestSeed
{
    public static async Task EnableRegistrationAsync(IServiceProvider services, CancellationToken cancellationToken)
    {
        using var scope = services.CreateScope();
        var settingsRepository = scope.ServiceProvider.GetRequiredService<ISettingsRepository>();

        if (await settingsRepository.GetAsync(cancellationToken) is not null)
        {
            return;
        }

        var sellerTypes = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var sellerType = SellerType.Create($"Seed-{Guid.NewGuid():N}", 15m, 0.5m);
        await sellerTypes.AddAsync(sellerType, cancellationToken);

        var settings = BAR.Domain.Settings.Settings.Create(
            registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
            bazaarFrom: null, bazaarUntil: null, defaultTypeId: sellerType.Id, infoText: null,
            startNumber: 1, blockSize: 10, defaultBlockCount: 1);
        await settingsRepository.SaveAsync(settings, cancellationToken);
    }
}
