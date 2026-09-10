using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Articles;

public class ArticlesEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticlesEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetMine_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/articles/mine", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task CreateThenGetMine_AuthenticatedSeller_RoundTrips()
    {
        var client = await RegisterAndAuthenticateAsync();

        var createResponse = await client.PostAsJsonAsync("/api/articles", new
        {
            name = "Winterjacke", brand = "Jako-O", category = "Jacken", price = 12.50m,
            size = "116", color = "rot", description = "kaum getragen"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);

        var mineResponse = await client.GetAsync("/api/articles/mine", TestContext.Current.CancellationToken);
        var body = await mineResponse.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Contains("Winterjacke", body);
    }

    [Fact]
    public async Task GetMine_PageZeroAndHugePageSize_DoesNotReturn500()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/articles/mine?page=0&pageSize=999999", TestContext.Current.CancellationToken);

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task GetMine_NegativePage_DoesNotReturn500()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/articles/mine?page=-5", TestContext.Current.CancellationToken);

        Assert.NotEqual(HttpStatusCode.InternalServerError, response.StatusCode);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Post_EmptyName_Returns400()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PostAsJsonAsync("/api/articles", new
        {
            name = "", brand = "B", category = "C", price = 1m
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Update_ForeignArticle_Returns404()
    {
        var owner = await RegisterAndAuthenticateAsync();
        var attacker = await RegisterAndAuthenticateAsync();
        var created = await owner.PostAsJsonAsync("/api/articles", new
        {
            name = "A", brand = "B", category = "C", price = 1m
        }, TestContext.Current.CancellationToken);
        var createdBody = await created.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);
        var id = createdBody.GetProperty("id").GetString();

        var response = await attacker.PutAsJsonAsync($"/api/articles/{id}", new
        {
            name = "Neu", brand = "B", category = "C", price = 1m
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private async Task<HttpClient> RegisterAndAuthenticateAsync()
    {
        await RegistrationTestSeed.EnableRegistrationAsync(_factory.Services, TestContext.Current.CancellationToken);

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

    private sealed record TokenPair(string AccessToken, string RefreshToken);
}
