using System.Net;
using System.Net.Http.Json;
using BAR.Modules.Operations.Domain.Ports;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.MasterData.Domain.SellerTypes;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Public;

public class PublicInfoEndpointTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public PublicInfoEndpointTests(PostgresWebApplicationFactory factory) => _factory = factory;

    /// <summary>
    /// R09: after deployment, no settings row exists yet (the normal state,
    /// see api/settings.md); the old, hardcoded seed row was removed via
    /// migration. This test deliberately runs as the only one in this class
    /// against the IClassFixture factory's fresh, unseeded DB - see the
    /// separate class <see cref="PublicInfoEndpointWithConfiguredSettingsTests"/>
    /// for the case with configured settings, so the two states don't share the same DB.
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
/// A separate test class (its own <see cref="PostgresWebApplicationFactory"/>
/// instance, its own Postgres container) for the case with configured
/// settings, so this seed write does not race against the "no settings yet"
/// test in <see cref="PublicInfoEndpointTests"/> over the same DB (execution
/// order within an xUnit test class is not guaranteed).
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
            var settings = BAR.Modules.Operations.Domain.Settings.Create(
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
