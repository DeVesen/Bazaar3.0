using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Sellers;

public class SellersEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public SellersEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task DeleteSeller_AdminDeletesOtherSeller_Returns204AndCascadesArticlesAndBlocks()
    {
        var (seller, sellerId) = await RegisterAndAuthenticateAsync();
        var createArticleResponse = await seller.PostAsJsonAsync("/api/articles", new
        {
            name = "Winterjacke", brand = "Jako-O", category = "Jacken", price = 12.50m,
            size = "116", color = "rot", description = "kaum getragen"
        }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Created, createArticleResponse.StatusCode);
        var admin = await AuthenticateAsAdminAsync();

        var response = await admin.DeleteAsync($"/api/sellers/{sellerId}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var blocks = scope.ServiceProvider.GetRequiredService<INumberBlockRepository>();
        var ct = TestContext.Current.CancellationToken;
        Assert.Null(await sellers.GetByIdAsync(sellerId, ct));
        Assert.Equal(0, await articles.CountForSellerAsync(sellerId, ct));
        Assert.Empty(await blocks.GetForSellerAsync(sellerId, ct));
    }

    [Fact]
    public async Task DeleteSeller_UnknownId_Returns404()
    {
        var admin = await AuthenticateAsAdminAsync();

        var response = await admin.DeleteAsync($"/api/sellers/{Guid.NewGuid()}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task DeleteSeller_SelfDelete_Returns409AndLeavesAdminIntact()
    {
        var admin = await AuthenticateAsAdminAsync();
        var adminId = await GetOwnSellerIdAsync(admin);

        var response = await admin.DeleteAsync($"/api/sellers/{adminId}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains("\"errorCode\":\"seller.self_delete_via_profile\"", body);
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        Assert.NotNull(await sellers.GetByIdAsync(adminId, TestContext.Current.CancellationToken));
    }

    private async Task<(HttpClient Client, string SellerId)> RegisterAndAuthenticateAsync()
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
        var sellerId = await GetOwnSellerIdAsync(client);
        return (client, sellerId);
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

    private async Task<string> GetOwnSellerIdAsync(HttpClient client)
    {
        var profileResponse = await client.GetAsync("/api/profile", TestContext.Current.CancellationToken);
        var profile = await profileResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        return profile.GetProperty("id").GetString()!;
    }

    private sealed record TokenPair(string AccessToken, string RefreshToken);
}
