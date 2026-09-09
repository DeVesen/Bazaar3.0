using System.Net;
using System.Net.Http.Json;

namespace BAR.Host.IntegrationTests.Features.Public;

public class PublicInfoEndpointTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public PublicInfoEndpointTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetInfo_WithoutToken_Returns200WithSeededDefaults()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/public/info", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PublicInfoPayload>(TestContext.Current.CancellationToken);
        Assert.NotNull(body!.DefaultConditions);
        Assert.Equal(15.0m, body.DefaultConditions!.CommissionRate);
    }

    private sealed record ConditionsPayload(decimal CommissionRate, decimal ItemFee);
    private sealed record PublicInfoPayload(ConditionsPayload? DefaultConditions, string? InfoText);
}
