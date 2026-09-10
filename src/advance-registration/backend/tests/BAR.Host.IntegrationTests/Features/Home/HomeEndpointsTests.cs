using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Home;

public class HomeEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public HomeEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetSellerHome_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/home/seller", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetSellerHome_AfterRegistration_ReturnsZeroArticlesAndResolvedType()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/home/seller", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<SellerHomePayload>(TestContext.Current.CancellationToken);
        Assert.Equal(0, body!.ArticleCount);
        Assert.Equal(15.0m, body.TypeConditions.CommissionRate);
    }

    [Fact]
    public async Task GetAdminHome_AsSeller_Returns403()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/home/admin", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetAdminHome_AsAdmin_ReturnsCounts()
    {
        var admin = await AuthenticateAsAdminAsync();

        var response = await admin.GetAsync("/api/home/admin", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<AdminHomePayload>(TestContext.Current.CancellationToken);
        Assert.True(body!.SellerCount >= 1);
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
    private sealed record TypeConditionsPayload(decimal CommissionRate, decimal ItemFee);
    private sealed record SellerHomePayload(int ArticleCount, TypeConditionsPayload TypeConditions);
    private sealed record AdminHomePayload(int SellerCount, int ArticleCount, int CategoryCount, int BrandCount);
}
