using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.MasterData;

public class CategoriesEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public CategoriesEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Post_AuthenticatedSeller_Creates201WithOriginalFalse()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PostAsJsonAsync("/api/categories", new { name = $"Jacken-{Guid.NewGuid():N}" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains("\"original\":false", body);
    }

    [Fact]
    public async Task Put_AsSeller_Returns403()
    {
        var client = await RegisterAndAuthenticateAsync();
        var created = await client.PostAsJsonAsync("/api/categories", new { name = $"X-{Guid.NewGuid():N}" }, TestContext.Current.CancellationToken);
        var body = await created.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);
        var id = body.GetProperty("id").GetString();

        var response = await client.PutAsJsonAsync($"/api/categories/{id}", new { name = "Y", original = true }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Put_AsAdmin_Returns200WithUpdatedName()
    {
        var seller = await RegisterAndAuthenticateAsync();
        var created = await seller.PostAsJsonAsync("/api/categories", new { name = $"Z-{Guid.NewGuid():N}" }, TestContext.Current.CancellationToken);
        var body = await created.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);
        var id = body.GetProperty("id").GetString();
        var admin = await AuthenticateAsAdminAsync();

        var newName = $"Renamed-{Guid.NewGuid():N}";
        var response = await admin.PutAsJsonAsync($"/api/categories/{id}", new { name = newName, original = true }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var responseBody = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains(newName, responseBody);
    }

    [Fact]
    public async Task Get_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/categories", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    private async Task<HttpClient> RegisterAndAuthenticateAsync()
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
        return client;
    }

    private async Task<HttpClient> AuthenticateAsAdminAsync()
    {
        var client = _factory.CreateClient();
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "admin@bazaar.local", password = "Admin123!"
        }, TestContext.Current.CancellationToken);
        var tokens = await loginResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        return client;
    }

    private sealed record TokenPair(string AccessToken, string RefreshToken);
}
