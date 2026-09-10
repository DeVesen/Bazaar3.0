using System.Net;
using System.Net.Http.Json;
using BAR.Domain.Ports;
using BAR.Domain.SellerTypes;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Public;

public class PublicInfoEndpointTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public PublicInfoEndpointTests(PostgresWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// R09: nach dem Deployment existiert noch keine settings-Zeile (Normalzustand,
    /// siehe api/settings.md); die alte, fest verdrahtete Seed-Zeile wurde per Migration
    /// entfernt. Dieser Test laeuft bewusst als einziger in dieser Klasse gegen die frische,
    /// ungeseedete DB der IClassFixture-Factory - siehe eigene Klasse
    /// <see cref="PublicInfoEndpointWithConfiguredSettingsTests"/> fuer den Fall mit
    /// konfigurierten Settings, damit sich beide Zustaende nicht die gleiche DB teilen.
    /// </summary>
    [Fact]
    public async Task GetInfo_NoSettingsConfigured_ReturnsNullConditions()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/public/info", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PublicInfoPayload>(TestContext.Current.CancellationToken);
        Assert.Null(body!.DefaultConditions);
    }

    private sealed record ConditionsPayload(decimal CommissionRate, decimal ItemFee);
    private sealed record PublicInfoPayload(ConditionsPayload? DefaultConditions, string? InfoText);
}

/// <summary>
/// Eigene Testklasse (eigene <see cref="PostgresWebApplicationFactory"/>-Instanz, eigener
/// Postgres-Container) fuer den Fall mit konfigurierten Settings, damit diese Seed-Schreibung
/// nicht mit dem "noch keine Settings"-Test in <see cref="PublicInfoEndpointTests"/> um dieselbe
/// DB konkurriert (Ausfuehrungsreihenfolge innerhalb einer xUnit-Testklasse ist nicht garantiert).
/// </summary>
public class PublicInfoEndpointWithConfiguredSettingsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public PublicInfoEndpointWithConfiguredSettingsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetInfo_WithConfiguredSettings_ReturnsResolvedConditions()
    {
        var cancellationToken = TestContext.Current.CancellationToken;
        using (var scope = _factory.Services.CreateScope())
        {
            var sellerTypes = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
            var sellerType = SellerType.Create($"Seed-{Guid.NewGuid():N}", 12m, 0.3m);
            await sellerTypes.AddAsync(sellerType, cancellationToken);

            var settingsRepository = scope.ServiceProvider.GetRequiredService<ISettingsRepository>();
            var settings = BAR.Domain.Settings.Settings.Create(
                registrationDeadline: null, dropOffFrom: null, dropOffUntil: null,
                bazaarFrom: null, bazaarUntil: null, defaultTypeId: sellerType.Id, infoText: null,
                startNumber: 1, blockSize: 10, defaultBlockCount: 1);
            await settingsRepository.SaveAsync(settings, cancellationToken);
        }

        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/public/info", cancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PublicInfoPayload>(cancellationToken);
        Assert.NotNull(body!.DefaultConditions);
        Assert.Equal(12m, body.DefaultConditions!.CommissionRate);
        Assert.Equal(0.3m, body.DefaultConditions.ItemFee);
    }

    private sealed record ConditionsPayload(decimal CommissionRate, decimal ItemFee);
    private sealed record PublicInfoPayload(ConditionsPayload? DefaultConditions, string? InfoText);
}
