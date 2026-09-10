using System.IdentityModel.Tokens.Jwt;
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

        var response = await client.GetAsync("/api/blocks/mine", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var blocks = await response.Content.ReadFromJsonAsync<List<BlockPayload>>(TestContext.Current.CancellationToken);
        Assert.Single(blocks!);
    }

    [Fact]
    public async Task GetSellerBlocks_AsAdmin_ReflectsUsedCountFromArticlesInRange()
    {
        var (sellerWithArticle, sellerWithArticleId) = await RegisterAndAuthenticateAsync();
        var (sellerWithoutArticle, sellerWithoutArticleId) = await RegisterAndAuthenticateAsync();
        var createArticleResponse = await sellerWithArticle.PostAsJsonAsync("/api/articles", new
        {
            name = "Winterjacke", brand = "Jako-O", category = "Jacken", price = 12.50m,
            size = "116", color = "rot", description = "kaum getragen"
        }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Created, createArticleResponse.StatusCode);
        var admin = await AuthenticateAsAdminAsync();

        var responseWithArticle = await admin.GetAsync($"/api/sellers/{sellerWithArticleId}/blocks", TestContext.Current.CancellationToken);
        var responseWithoutArticle = await admin.GetAsync($"/api/sellers/{sellerWithoutArticleId}/blocks", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, responseWithArticle.StatusCode);
        Assert.Equal(HttpStatusCode.OK, responseWithoutArticle.StatusCode);
        var blocksWithArticle = await responseWithArticle.Content.ReadFromJsonAsync<List<BlockPayload>>(TestContext.Current.CancellationToken);
        var blocksWithoutArticle = await responseWithoutArticle.Content.ReadFromJsonAsync<List<BlockPayload>>(TestContext.Current.CancellationToken);
        Assert.Single(blocksWithArticle!);
        Assert.Single(blocksWithoutArticle!);
        Assert.Equal(1, blocksWithArticle![0].UsedCount);
        Assert.Equal(0, blocksWithoutArticle![0].UsedCount);
    }

    [Fact]
    public async Task ReserveBlocks_NegativeBlockCount_Returns400InsteadOf500()
    {
        var (_, sellerId) = await RegisterAndAuthenticateAsync();
        var admin = await AuthenticateAsAdminAsync();

        var response = await admin.PostAsJsonAsync($"/api/sellers/{sellerId}/blocks", new
        {
            blockCount = -1
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReserveBlocks_ZeroBlockCount_Returns400InsteadOfEmptyResult()
    {
        var (_, sellerId) = await RegisterAndAuthenticateAsync();
        var admin = await AuthenticateAsAdminAsync();

        var response = await admin.PostAsJsonAsync($"/api/sellers/{sellerId}/blocks", new
        {
            blockCount = 0
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ReserveBlocks_StartNumberBelowSettingsStartNumber_Returns409BlockOverlap()
    {
        var (_, sellerId) = await RegisterAndAuthenticateAsync();
        var admin = await AuthenticateAsAdminAsync();

        var response = await admin.PostAsJsonAsync($"/api/sellers/{sellerId}/blocks", new
        {
            startNumber = 0,
            blockCount = 1
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains("\"errorCode\":\"block.overlap\"", body);
    }

    [Fact]
    public async Task NextFree_ZeroBlockCount_Returns400InsteadOf500()
    {
        var admin = await AuthenticateAsAdminAsync();

        var response = await admin.GetAsync("/api/blocks/next-free?blockCount=0", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task<(HttpClient Client, string SellerId)> RegisterAndAuthenticateAsync()
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
        var sellerId = new JwtSecurityTokenHandler().ReadJwtToken(tokens.AccessToken).Claims.Single(c => c.Type == "sub").Value;
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

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record BlockPayload(string Id, int FromNumber, int ToNumber, int UsedCount);
}
