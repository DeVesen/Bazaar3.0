using BAR.Modules.Operations.Domain.Ports;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.MasterData.Domain.SellerTypes;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Public;

/// <summary>
/// Since R09, no pre-seeded <c>settings</c> row exists after deployment
/// (the normal state, see api/settings.md) - registration is then correctly
/// locked with <c>409 registration.not_enabled</c> (api/auth.md). Existing
/// integration tests for other features use registration only as setup to
/// obtain an authenticated seller; to do that they now need to create a
/// minimal, valid settings record themselves. Since the modulith cut,
/// SellerType (MasterData) and Settings (Operations) live in separate
/// schemas/DbContexts - both are created here via their respective facade,
/// from the same DI scope.
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

        var settings = BAR.Modules.Operations.Domain.Settings.Create(
            registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
            bazaarFrom: null, bazaarUntil: null, defaultTypeId: sellerType.Id, infoText: null,
            startNumber: 1, blockSize: 10, defaultBlockCount: 1);
        await settingsRepository.SaveAsync(settings, cancellationToken);
    }
}
