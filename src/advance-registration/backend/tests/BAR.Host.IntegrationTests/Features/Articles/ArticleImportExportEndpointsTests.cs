using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Articles;

public class ArticleImportExportEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ArticleImportExportEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task Export_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/articles/mine/export", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Export_AuthenticatedSeller_ReturnsCsvWithHeaderAndOwnNumberRange()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/articles/mine/export", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("text/csv; charset=utf-8", response.Content.Headers.ContentType!.ToString());
        Assert.StartsWith("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n", body);
    }

    [Fact]
    public async Task Template_ExistingArticle_RowStillOnlyHasNumber()
    {
        var client = await RegisterAndAuthenticateAsync();
        await client.PostAsJsonAsync("/api/articles", new { name = "A", brand = "B", category = "C", price = 1m }, TestContext.Current.CancellationToken);

        var response = await client.GetAsync("/api/articles/mine/template", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        var firstDataLine = body.Split("\r\n")[1];

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.EndsWith(";;;;;", firstDataLine);
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
