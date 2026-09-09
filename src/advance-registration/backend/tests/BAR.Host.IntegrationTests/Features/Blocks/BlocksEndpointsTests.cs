using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Blocks;

public class BlocksEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public BlocksEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetMine_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/blocks/mine", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetMine_AfterRegistration_ReturnsOwnBlock()
    {
        var client = _factory.CreateClient();
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"{Guid.NewGuid()}@example.com", password = "geheim123!",
            firstName = "Anna", lastName = "Beispiel", address = "Hauptstr. 1",
            postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
        }, TestContext.Current.CancellationToken);
        var tokens = await registerResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);

        var response = await client.GetAsync("/api/blocks/mine", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var blocks = await response.Content.ReadFromJsonAsync<List<BlockPayload>>(TestContext.Current.CancellationToken);
        Assert.Single(blocks!);
    }

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record BlockPayload(string Id, int FromNumber, int ToNumber);
}
