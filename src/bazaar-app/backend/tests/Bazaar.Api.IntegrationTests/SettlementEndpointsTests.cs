using System.Net;

namespace Bazaar.Api.IntegrationTests;

/// <summary>
/// Round-20 Task 4: wie HealthEndpointTests gegen einen echten PostgreSQL-Container
/// (PostgresWebApplicationFactory) - andere Endpoints (SellerEndpoints/SalesEndpoints)
/// haben noch keine eigenen Api-Tests, deshalb wird hier deren einziges vorhandenes
/// Muster (WebApplicationFactory + Testcontainer) übernommen. Geprüft wird die
/// RequireAuthorization()-Verdrahtung beider neuen Endpoints ohne Auth-Header - ein
/// echter Happy-Path bräuchte zusätzlich einen eingeloggten Testnutzer samt Seed-Daten,
/// was für keinen bestehenden Endpoint in diesem Projekt aufgebaut ist.
/// </summary>
public class SettlementEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SettlementEndpointsTests(PostgresWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetSellerSettlement_WithoutAuth_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.GetAsync("/api/sellers/some-id/settlement", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task ReturnArticle_WithoutAuth_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();
        var response = await client.PutAsync("/api/articles/some-id/return", content: null, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
}
