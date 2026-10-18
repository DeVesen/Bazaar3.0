using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;

namespace Bazaar.Api.IntegrationTests;

/// <summary>
/// Boots the real host so the endpoint metadata Minimal APIs attach at startup is in play:
/// binding an <c>IFormFile</c> parameter adds anti-forgery metadata, and without
/// <c>DisableAntiforgery()</c> the request fails with a 500 because Program.cs registers no
/// anti-forgery middleware. The unit tests in Bazaar.Api.UnitTests call the parsing helpers
/// directly and cannot see this. Like BootstrapEndpointsTests, each test gets its own fresh
/// database so bootstrap-admin can hand out an admin token.
/// </summary>
public class ImportEndpointsTests : IAsyncLifetime
{
    private const string ImportFileJson = """
        {
          "generatedAt": "2026-10-18T20:39:58Z",
          "sellers": [
            {
              "id": "S0000001",
              "firstName": "Test",
              "lastName": "Verkaeufer",
              "city": "Teststadt",
              "sellerType": "Standard",
              "articles": [
                { "id": "A0000001", "number": 1, "name": "Ski", "brand": "Testmarke", "category": "Ski", "price": 75.00 },
                { "id": "A0000002", "number": 2, "name": "Skijacke", "brand": "Testmarke", "category": "Skijacke", "price": 25.00 }
              ]
            }
          ],
          "brands": [],
          "categories": []
        }
        """;

    private PostgresWebApplicationFactory _factory = null!;

    public async ValueTask InitializeAsync()
    {
        _factory = new PostgresWebApplicationFactory();
        await _factory.InitializeAsync();
    }

    public async ValueTask DisposeAsync()
    {
        await _factory.DisposeAsync();
    }

    [Fact]
    public async Task PostImportPreview_AsAdminWithMultipartFile_ReturnsPreview()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await BootstrapAdminToken(client));
        using var content = new MultipartFormDataContent();
        var file = new ByteArrayContent(Encoding.UTF8.GetBytes(ImportFileJson));
        file.Headers.ContentType = new MediaTypeHeaderValue("application/json");
        content.Add(file, "file", "basar-export.json");

        var response = await client.PostAsync("/api/import/preview", content, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<PreviewBody>(TestContext.Current.CancellationToken);
        Assert.Equal(1, body!.SellerCount);
        Assert.Equal(2, body.ArticleCount);
        Assert.Equal(1, body.NewSellers);
    }

    private static async Task<string> BootstrapAdminToken(HttpClient client)
    {
        var response = await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "import-admin", password = "changeme1" },
            TestContext.Current.CancellationToken);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<BootstrapAdminBody>(TestContext.Current.CancellationToken);
        return body!.AccessToken;
    }

    private sealed record BootstrapAdminBody(string AccessToken);

    private sealed record PreviewBody(int SellerCount, int ArticleCount, int NewSellers);
}
