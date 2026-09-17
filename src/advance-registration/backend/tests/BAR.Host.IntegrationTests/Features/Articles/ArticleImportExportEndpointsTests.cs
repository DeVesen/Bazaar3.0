using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using System.Text.Json;
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

    [Fact]
    public async Task Import_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();
        using var content = BuildMultipart("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n");

        var response = await client.PostAsync("/api/articles/mine/import", content, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Import_RoundTripUnchangedExport_CreatesNothing()
    {
        var client = await RegisterAndAuthenticateAsync();
        await client.PostAsJsonAsync("/api/articles", new { name = "Jacke", brand = "Nike", category = "Jacken", price = 12.5m }, TestContext.Current.CancellationToken);
        var exportCsv = await (await client.GetAsync("/api/articles/mine/export", TestContext.Current.CancellationToken)).Content.ReadAsStringAsync(TestContext.Current.CancellationToken);

        using var content = BuildMultipart(exportCsv);
        var response = await client.PostAsync("/api/articles/mine/import", content, TestContext.Current.CancellationToken);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal(0, body.GetProperty("created").GetInt32());
        Assert.Equal(1, body.GetProperty("updated").GetInt32());
        Assert.Equal(0, body.GetProperty("deleted").GetInt32());
    }

    [Fact]
    public async Task Import_NumberOutsideOwnRange_Returns422WithRowError_AndCreatesNothing()
    {
        var client = await RegisterAndAuthenticateAsync();
        using var content = BuildMultipart("Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n999999;A;B;C;;1,00\r\n");

        var response = await client.PostAsync("/api/articles/mine/import", content, TestContext.Current.CancellationToken);
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);

        Assert.Equal((HttpStatusCode)422, response.StatusCode);
        Assert.Equal("import.number_not_in_own_range", body.GetProperty("errors")[0].GetProperty("errorCode").GetString());

        var mine = await client.GetAsync("/api/articles/mine", TestContext.Current.CancellationToken);
        var mineBody = await mine.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);
        Assert.Equal(0, mineBody.GetProperty("totalCount").GetInt32());
    }

    [Fact]
    public async Task Import_UnknownBrand_IsAutoCreated()
    {
        var client = await RegisterAndAuthenticateAsync();
        var nextNumber = (await (await client.GetAsync("/api/articles/next-number", TestContext.Current.CancellationToken)).Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken)).GetProperty("number").GetInt32();
        var brandName = $"Marke-{Guid.NewGuid():N}"[..12];
        using var content = BuildMultipart($"Nummer;Bezeichnung;Kategorie;Marke;Größe;Preis\r\n{nextNumber};A;B;{brandName};;1,00\r\n");

        var response = await client.PostAsync("/api/articles/mine/import", content, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var brandsResponse = await client.GetAsync("/api/brands", TestContext.Current.CancellationToken);
        var brandsBody = await brandsResponse.Content.ReadAsStringAsync(TestContext.Current.CancellationToken);
        Assert.Contains(brandName, brandsBody);
    }

    private static MultipartFormDataContent BuildMultipart(string csv)
    {
        var content = new MultipartFormDataContent();
        var fileContent = new ByteArrayContent(Encoding.UTF8.GetBytes(csv));
        fileContent.Headers.ContentType = new MediaTypeHeaderValue("text/csv");
        content.Add(fileContent, "file", "import.csv");
        return content;
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
