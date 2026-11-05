using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Bazaar.Api.IntegrationTests;

/// <summary>
/// Endpoints der Bilder-Bibliothek des Etiketten-Vordrucks gegen echtes PostgreSQL
/// (Testcontainers, Docker nötig). Jeder Test bekommt eine frische Datenbank, damit
/// bootstrap-admin ein Admin-Token ausgeben kann (wie BlankLabelEndpointsTests).
/// </summary>
public class LabelImageEndpointsTests : IAsyncLifetime
{
    private const string ImagesUrl = "/api/label-images";
    private const string DefaultsUrl = "/api/label-print-defaults";
    private const string NotFoundErrorCode = "label_image.not_found";
    private const string LibraryFullErrorCode = "label_image.library_full";
    private const int LibraryMaxCount = 50;

    // Pro Testlauf erzeugt; die Datenbank ist ohnehin frisch und wegwerfbar.
    private static readonly string TestPassword = $"pw-{Guid.NewGuid():N}";

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

    [Theory]
    [InlineData("GET", ImagesUrl)]
    [InlineData("GET", ImagesUrl + "/LIM00001")]
    [InlineData("POST", ImagesUrl)]
    [InlineData("DELETE", ImagesUrl + "/LIM00001")]
    public async Task Endpoints_WithoutAuth_ReturnUnauthorized(string method, string url)
    {
        // Arrange
        var client = _factory.CreateClient();
        using var request = CreateRequest(method, url);

        // Act
        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Theory]
    [InlineData("GET", ImagesUrl)]
    [InlineData("GET", ImagesUrl + "/LIM00001")]
    [InlineData("POST", ImagesUrl)]
    [InlineData("DELETE", ImagesUrl + "/LIM00001")]
    public async Task Endpoints_AsCashier_ReturnForbidden(string method, string url)
    {
        // Arrange
        var client = _factory.CreateClient();
        var adminToken = await BootstrapAdminToken(client);
        var cashierToken = await CreateCashierToken(client, adminToken);
        using var request = CreateRequest(method, url);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", cashierToken);

        // Act
        var response = await client.SendAsync(request, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Post_Png_ReturnsCreatedAndIsListedWithoutContent()
    {
        // Arrange
        var client = await AdminClient();

        // Act
        var response = await client.PostAsJsonAsync(ImagesUrl, new { name = " Logo ", dataUrl = PngDataUrl(1) }, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var created = await response.Content.ReadFromJsonAsync<SummaryBody>(TestContext.Current.CancellationToken);
        Assert.Equal("Logo", created!.Name);
        Assert.Equal("image/png", created.MediaType);
        Assert.Equal(4, created.SizeBytes);
        var listJson = await client.GetStringAsync(ImagesUrl, TestContext.Current.CancellationToken);
        Assert.Contains(created.Id, listJson);
        Assert.DoesNotContain("dataUrl", listJson);
    }

    [Fact]
    public async Task GetById_UploadedImage_ReturnsSameDataUrl()
    {
        // Arrange
        var client = await AdminClient();
        var dataUrl = PngDataUrl(2);
        var post = await client.PostAsJsonAsync(ImagesUrl, new { name = "Logo", dataUrl }, TestContext.Current.CancellationToken);
        var created = await post.Content.ReadFromJsonAsync<SummaryBody>(TestContext.Current.CancellationToken);

        // Act
        var image = await client.GetFromJsonAsync<ImageBody>($"{ImagesUrl}/{created!.Id}", TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(new ImageBody(created.Id, "Logo", dataUrl), image);
    }

    [Fact]
    public async Task GetById_UnknownId_ReturnsNotFoundWithErrorCode()
    {
        // Arrange
        var client = await AdminClient();

        // Act
        var response = await client.GetAsync($"{ImagesUrl}/UNKNOWN1", TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemBody>(TestContext.Current.CancellationToken);
        Assert.Equal(NotFoundErrorCode, problem!.ErrorCode);
    }

    [Theory]
    [InlineData("data:image/gif;base64,AAAA")]
    [InlineData("data:image/png;base64,***")]
    public async Task Post_InvalidDataUrl_ReturnsBadRequestAndLibraryStaysEmpty(string dataUrl)
    {
        // Arrange
        var client = await AdminClient();

        // Act
        var response = await client.PostAsJsonAsync(ImagesUrl, new { name = "Logo", dataUrl }, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationBody>(TestContext.Current.CancellationToken);
        Assert.True(problem!.Errors.ContainsKey("dataUrl"));
        Assert.Empty((await client.GetFromJsonAsync<SummaryBody[]>(ImagesUrl, TestContext.Current.CancellationToken))!);
    }

    [Fact]
    public async Task Post_BlankName_ReturnsBadRequestWithNameError()
    {
        // Arrange
        var client = await AdminClient();

        // Act
        var response = await client.PostAsJsonAsync(ImagesUrl, new { name = "  ", dataUrl = PngDataUrl(1) }, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationBody>(TestContext.Current.CancellationToken);
        Assert.True(problem!.Errors.ContainsKey("name"));
    }

    [Fact]
    public async Task Post_SameContentTwice_ReturnsOkWithSameIdAndSingleEntry()
    {
        // Arrange
        var client = await AdminClient();
        var first = await client.PostAsJsonAsync(ImagesUrl, new { name = "Logo", dataUrl = PngDataUrl(3) }, TestContext.Current.CancellationToken);
        var firstBody = await first.Content.ReadFromJsonAsync<SummaryBody>(TestContext.Current.CancellationToken);

        // Act
        var second = await client.PostAsJsonAsync(ImagesUrl, new { name = "Anderer Name", dataUrl = PngDataUrl(3) }, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.OK, second.StatusCode);
        var secondBody = await second.Content.ReadFromJsonAsync<SummaryBody>(TestContext.Current.CancellationToken);
        Assert.Equal(firstBody!.Id, secondBody!.Id);
        Assert.Single((await client.GetFromJsonAsync<SummaryBody[]>(ImagesUrl, TestContext.Current.CancellationToken))!);
    }

    [Fact]
    public async Task Post_LibraryFull_ReturnsConflictLibraryFull()
    {
        // Arrange
        var client = await AdminClient();
        for (var index = 0; index < LibraryMaxCount; index++)
        {
            var filled = await client.PostAsJsonAsync(ImagesUrl, new { name = $"Bild {index}", dataUrl = PngDataUrl(index) }, TestContext.Current.CancellationToken);
            filled.EnsureSuccessStatusCode();
        }

        // Act
        var response = await client.PostAsJsonAsync(ImagesUrl, new { name = "Zu viel", dataUrl = PngDataUrl(LibraryMaxCount) }, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemBody>(TestContext.Current.CancellationToken);
        Assert.Equal(LibraryFullErrorCode, problem!.ErrorCode);
        var images = await client.GetFromJsonAsync<SummaryBody[]>(ImagesUrl, TestContext.Current.CancellationToken);
        Assert.Equal(LibraryMaxCount, images!.Length);
    }

    [Fact]
    public async Task Delete_Existing_ReturnsNoContentAndKeepsChosenLogoInDefaults()
    {
        // Arrange
        var client = await AdminClient();
        var dataUrl = PngDataUrl(4);
        var post = await client.PostAsJsonAsync(ImagesUrl, new { name = "Logo", dataUrl }, TestContext.Current.CancellationToken);
        var created = await post.Content.ReadFromJsonAsync<SummaryBody>(TestContext.Current.CancellationToken);
        var defaults = new { logo = new { kind = "image", value = dataUrl }, sellerSymbol = (object?)null, currencySymbol = "€" };
        (await client.PutAsJsonAsync(DefaultsUrl, defaults, TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

        // Act
        var response = await client.DeleteAsync($"{ImagesUrl}/{created!.Id}", TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var afterDelete = await client.GetAsync($"{ImagesUrl}/{created.Id}", TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.NotFound, afterDelete.StatusCode);
        var kept = await client.GetFromJsonAsync<DefaultsBody>(DefaultsUrl, TestContext.Current.CancellationToken);
        Assert.Equal(dataUrl, kept!.Logo!.Value);
    }

    [Fact]
    public async Task Delete_UnknownId_ReturnsNotFound()
    {
        // Arrange
        var client = await AdminClient();

        // Act
        var response = await client.DeleteAsync($"{ImagesUrl}/UNKNOWN1", TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    private static HttpRequestMessage CreateRequest(string method, string url)
    {
        var request = new HttpRequestMessage(new HttpMethod(method), url);
        if (method == "POST") request.Content = JsonContent.Create(new { name = "Logo", dataUrl = PngDataUrl(1) });
        return request;
    }

    private static string PngDataUrl(int seed) =>
        $"data:image/png;base64,{Convert.ToBase64String(BitConverter.GetBytes(seed))}";

    private async Task<HttpClient> AdminClient()
    {
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", await BootstrapAdminToken(client));
        return client;
    }

    private static async Task<string> BootstrapAdminToken(HttpClient client)
    {
        var response = await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "label-admin", password = TestPassword },
            TestContext.Current.CancellationToken);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<TokenBody>(TestContext.Current.CancellationToken);
        return body!.AccessToken;
    }

    private static async Task<string> CreateCashierToken(HttpClient client, string adminToken)
    {
        using var createRequest = new HttpRequestMessage(HttpMethod.Post, "/api/users")
        {
            Content = JsonContent.Create(new { username = "kasse", role = "cashier", initialPassword = TestPassword }),
        };
        createRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        (await client.SendAsync(createRequest, TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

        var login = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { username = "kasse", password = TestPassword },
            TestContext.Current.CancellationToken);
        login.EnsureSuccessStatusCode();
        var body = await login.Content.ReadFromJsonAsync<TokenBody>(TestContext.Current.CancellationToken);
        return body!.AccessToken;
    }

    private sealed record TokenBody(string AccessToken);

    private sealed record SummaryBody(string Id, string Name, string MediaType, int SizeBytes, DateTimeOffset CreatedAt);

    private sealed record ImageBody(string Id, string Name, string DataUrl);

    private sealed record ProblemBody(string? ErrorCode);

    private sealed record ValidationBody(Dictionary<string, string[]> Errors);

    private sealed record GraphicBody(string Kind, string Value);

    private sealed record DefaultsBody(GraphicBody? Logo, GraphicBody? SellerSymbol, string CurrencySymbol);
}
