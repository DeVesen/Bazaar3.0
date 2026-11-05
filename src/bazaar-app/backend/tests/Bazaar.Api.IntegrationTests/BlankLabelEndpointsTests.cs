using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;

namespace Bazaar.Api.IntegrationTests;

/// <summary>
/// Endpoints des Etiketten-Vordrucks gegen echtes PostgreSQL (Testcontainers, Docker nötig).
/// Wie ImportEndpointsTests bekommt jeder Test eine frische Datenbank, damit bootstrap-admin
/// ein Admin-Token ausgeben kann.
/// </summary>
public class BlankLabelEndpointsTests : IAsyncLifetime
{
    private const string FormatsUrl = "/api/label-sheet-formats";
    private const string DefaultsUrl = "/api/label-print-defaults";
    private const string NameTakenErrorCode = "label_sheet_format.name_taken";

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
    public async Task GetFormats_WithoutAuth_ReturnsUnauthorized()
    {
        // Arrange
        var client = _factory.CreateClient();

        // Act
        var response = await client.GetAsync(FormatsUrl, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetFormats_AsCashier_ReturnsForbidden()
    {
        // Arrange
        var client = _factory.CreateClient();
        var adminToken = await BootstrapAdminToken(client);
        var cashierToken = await CreateCashierToken(client, adminToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", cashierToken);

        // Act
        var response = await client.GetAsync(FormatsUrl, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task PostFormat_PaddedName_IsListedTrimmed()
    {
        // Arrange
        var client = await AdminClient();
        var post = await client.PostAsJsonAsync(FormatsUrl, Avery16(" Avery 12er "), TestContext.Current.CancellationToken);
        post.EnsureSuccessStatusCode();

        // Act
        var formats = await client.GetFromJsonAsync<FormatBody[]>(FormatsUrl, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal("Avery 12er", Assert.Single(formats!).Name);
    }

    [Fact]
    public async Task PostFormat_WithOffset_IsListedWithOffset()
    {
        // Arrange
        var client = await AdminClient();
        var post = await client.PostAsJsonAsync(FormatsUrl, Avery16("Versetzt", offsetX: -2.5m, offsetY: 3m), TestContext.Current.CancellationToken);
        post.EnsureSuccessStatusCode();

        // Act
        var formats = await client.GetFromJsonAsync<FormatBody[]>(FormatsUrl, TestContext.Current.CancellationToken);

        // Assert
        var format = Assert.Single(formats!);
        Assert.Equal(-2.5m, format.OffsetX);
        Assert.Equal(3m, format.OffsetY);
    }

    [Fact]
    public async Task PostFormat_OffsetBeyond20_ReturnsBadRequest()
    {
        // Arrange
        var client = await AdminClient();

        // Act
        var response = await client.PostAsJsonAsync(FormatsUrl, Avery16("Zu weit", offsetX: 20.1m), TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PostFormat_SameNameWithoutOverwrite_ReturnsConflictNameTaken()
    {
        // Arrange
        var client = await AdminClient();
        (await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er"), TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

        // Act
        var response = await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er", rows: 7), TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ProblemBody>(TestContext.Current.CancellationToken);
        Assert.Equal(NameTakenErrorCode, problem!.ErrorCode);
    }

    [Fact]
    public async Task PostFormat_SameNameWithOverwrite_ReplacesFormat()
    {
        // Arrange
        var client = await AdminClient();
        (await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er"), TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

        // Act
        var response = await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er", rows: 7, overwrite: true), TestContext.Current.CancellationToken);

        // Assert
        response.EnsureSuccessStatusCode();
        var formats = await client.GetFromJsonAsync<FormatBody[]>(FormatsUrl, TestContext.Current.CancellationToken);
        Assert.Equal(7, Assert.Single(formats!).Rows);
    }

    [Fact]
    public async Task PostFormat_ThreeColumnsOnA4_ReturnsBadRequestWithColumnsError()
    {
        // Arrange
        var client = await AdminClient();

        // Act
        var response = await client.PostAsJsonAsync(FormatsUrl, Avery16("Zu breit", columns: 3), TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
        var problem = await response.Content.ReadFromJsonAsync<ValidationBody>(TestContext.Current.CancellationToken);
        Assert.True(problem!.Errors.ContainsKey("columns"));
    }

    [Fact]
    public async Task DeleteFormat_ExistingFormat_RemovesItFromList()
    {
        // Arrange
        var client = await AdminClient();
        var post = await client.PostAsJsonAsync(FormatsUrl, Avery16("Avery 12er"), TestContext.Current.CancellationToken);
        var saved = await post.Content.ReadFromJsonAsync<FormatBody>(TestContext.Current.CancellationToken);

        // Act
        var response = await client.DeleteAsync($"{FormatsUrl}/{saved!.Id}", TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var formats = await client.GetFromJsonAsync<FormatBody[]>(FormatsUrl, TestContext.Current.CancellationToken);
        Assert.Empty(formats!);
    }

    [Fact]
    public async Task GetDefaults_NothingPrintedYet_ReturnsEuroDefaultSizesWithoutGraphics()
    {
        // Arrange
        var client = await AdminClient();

        // Act
        var defaults = await client.GetFromJsonAsync<DefaultsBody>(DefaultsUrl, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal("€", defaults!.CurrencySymbol);
        Assert.Null(defaults.Logo);
        Assert.Null(defaults.SellerSymbol);
        Assert.Equal(21.5m, defaults.QrCodeSize);
        Assert.Equal(5m, defaults.SellerSymbolSize);
        Assert.Equal(10.5m, defaults.NumberHeight);
        Assert.Equal(12m, defaults.CurrencyHeight);
    }

    [Fact]
    public async Task PutDefaults_IconImageDollarAndSizes_AreReturnedByGet()
    {
        // Arrange
        var client = await AdminClient();
        var body = new
        {
            logo = new { kind = "image", value = "data:image/png;base64,AAAA" },
            sellerSymbol = new { kind = "icon", value = "star" },
            currencySymbol = "$",
            qrCodeSize = 25.5m,
            sellerSymbolSize = 6m,
            numberHeight = 9.5m,
            currencyHeight = 11m,
        };
        (await client.PutAsJsonAsync(DefaultsUrl, body, TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

        // Act
        var defaults = await client.GetFromJsonAsync<DefaultsBody>(DefaultsUrl, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(new GraphicBody("image", "data:image/png;base64,AAAA"), defaults!.Logo);
        Assert.Equal(new GraphicBody("icon", "star"), defaults.SellerSymbol);
        Assert.Equal("$", defaults.CurrencySymbol);
        Assert.Equal(25.5m, defaults.QrCodeSize);
        Assert.Equal(6m, defaults.SellerSymbolSize);
        Assert.Equal(9.5m, defaults.NumberHeight);
        Assert.Equal(11m, defaults.CurrencyHeight);
    }

    [Fact]
    public async Task PutDefaults_GifLogo_ReturnsBadRequest()
    {
        // Arrange
        var client = await AdminClient();
        var body = new
        {
            logo = new { kind = "image", value = "data:image/gif;base64,AAAA" },
            sellerSymbol = (object?)null,
            currencySymbol = "€",
            qrCodeSize = 21.5m,
            sellerSymbolSize = 5m,
            numberHeight = 10.5m,
            currencyHeight = 12m,
        };

        // Act
        var response = await client.PutAsJsonAsync(DefaultsUrl, body, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task PutDefaults_SizeWithTwoDecimals_ReturnsBadRequest()
    {
        // Arrange
        var client = await AdminClient();
        var body = new
        {
            logo = (object?)null,
            sellerSymbol = (object?)null,
            currencySymbol = "€",
            qrCodeSize = 21.55m,
            sellerSymbolSize = 5m,
            numberHeight = 10.5m,
            currencyHeight = 12m,
        };

        // Act
        var response = await client.PutAsJsonAsync(DefaultsUrl, body, TestContext.Current.CancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private static object Avery16(
        string name, int columns = 2, int rows = 8, bool overwrite = false, decimal offsetX = 0m, decimal offsetY = 0m) => new
    {
        name,
        sheetWidth = 210m,
        sheetHeight = 297m,
        labelWidth = 105m,
        labelHeight = 35m,
        marginTop = 8.5m,
        marginRight = 0m,
        marginBottom = 8.5m,
        marginLeft = 0m,
        gapHorizontal = 0m,
        gapVertical = 0m,
        columns,
        rows,
        offsetX,
        offsetY,
        overwrite,
    };

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
            new { username = "label-admin", password = "changeme1" },
            TestContext.Current.CancellationToken);
        response.EnsureSuccessStatusCode();
        var body = await response.Content.ReadFromJsonAsync<TokenBody>(TestContext.Current.CancellationToken);
        return body!.AccessToken;
    }

    private static async Task<string> CreateCashierToken(HttpClient client, string adminToken)
    {
        using var createRequest = new HttpRequestMessage(HttpMethod.Post, "/api/users")
        {
            Content = JsonContent.Create(new { username = "kasse", role = "cashier", initialPassword = "kasse1234" }),
        };
        createRequest.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        (await client.SendAsync(createRequest, TestContext.Current.CancellationToken)).EnsureSuccessStatusCode();

        var login = await client.PostAsJsonAsync(
            "/api/auth/login",
            new { username = "kasse", password = "kasse1234" },
            TestContext.Current.CancellationToken);
        login.EnsureSuccessStatusCode();
        var body = await login.Content.ReadFromJsonAsync<TokenBody>(TestContext.Current.CancellationToken);
        return body!.AccessToken;
    }

    private sealed record TokenBody(string AccessToken);

    private sealed record FormatBody(string Id, string Name, int Columns, int Rows, decimal OffsetX, decimal OffsetY);

    private sealed record ProblemBody(string? ErrorCode);

    private sealed record ValidationBody(Dictionary<string, string[]> Errors);

    private sealed record GraphicBody(string Kind, string Value);

    private sealed record DefaultsBody(
        GraphicBody? Logo,
        GraphicBody? SellerSymbol,
        string CurrencySymbol,
        decimal QrCodeSize,
        decimal SellerSymbolSize,
        decimal NumberHeight,
        decimal CurrencyHeight);
}
