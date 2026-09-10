using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Application.Abstractions;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Domain.Ports;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Settings;

public class SettingsEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SettingsEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private async Task<(HttpClient Client, string SellerTypeId)> CreateAdminClientAsync()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var types = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var tokenIssuer = scope.ServiceProvider.GetRequiredService<ITokenIssuer>();
        var ct = TestContext.Current.CancellationToken;

        var seedType = SellerType.Create($"Seed-{Guid.NewGuid():N}", 10m, 0.20m);
        await types.AddAsync(seedType, ct);
        var admin = Seller.Register("Admin", "User", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", seedType.Id, "hash", isAdmin: true);
        await sellers.AddAsync(admin, ct);

        var token = tokenIssuer.IssueAccessToken(admin.Id, "admin", DateTime.UtcNow);
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return (client, seedType.Id);
    }

    /// <summary>
    /// Vergleicht zwei Zeitstempel mit Toleranz statt exakter Gleichheit, weil Postgres
    /// (timestamptz, Mikrosekunden-Aufloesung) und .NET DateTime (100ns-Ticks) leicht
    /// unterschiedliche Praezision haben und das JSON-Roundtrip zusaetzlich rundet.
    /// </summary>
    private static void AssertCloseTo(DateTime expected, DateTime actual)
    {
        var difference = (expected.ToUniversalTime() - actual.ToUniversalTime()).Duration();
        Assert.True(difference < TimeSpan.FromMilliseconds(1),
            $"Expected {expected:O} to be close to {actual:O}, but they differ by {difference}.");
    }

    private async Task<HttpClient> CreateNonAdminClientAsync()
    {
        _ = _factory.Server;
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var types = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var tokenIssuer = scope.ServiceProvider.GetRequiredService<ITokenIssuer>();
        var ct = TestContext.Current.CancellationToken;

        var seedType = SellerType.Create($"Seed-{Guid.NewGuid():N}", 10m, 0.20m);
        await types.AddAsync(seedType, ct);
        var seller = Seller.Register("Seller", "User", null, "76133", "Karlsruhe", "0721", $"{Guid.NewGuid()}@example.com", seedType.Id, "hash", isAdmin: false);
        await sellers.AddAsync(seller, ct);

        var token = tokenIssuer.IssueAccessToken(seller.Id, "seller", DateTime.UtcNow);
        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);
        return client;
    }

    [Fact]
    public async Task Get_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/settings", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Put_ValidPayload_Returns200AndPersists()
    {
        var (client, sellerTypeId) = await CreateAdminClientAsync();
        var now = DateTime.UtcNow;
        var payload = new
        {
            registrationDeadline = now, dropOffFrom = now, dropOffUntil = now,
            bazaarFrom = now, bazaarUntil = now, defaultTypeId = sellerTypeId,
            infoText = "Hinweis", startNumber = 1, blockSize = 10, defaultBlockCount = 1
        };

        var response = await client.PutAsJsonAsync("/api/settings", payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var getResponse = await client.GetAsync("/api/settings", TestContext.Current.CancellationToken);
        var body = await getResponse.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        AssertCloseTo(payload.registrationDeadline, DateTime.Parse(body.GetProperty("registrationDeadline").GetString()!));
        AssertCloseTo(payload.dropOffFrom, DateTime.Parse(body.GetProperty("dropOffFrom").GetString()!));
        AssertCloseTo(payload.dropOffUntil, DateTime.Parse(body.GetProperty("dropOffUntil").GetString()!));
        AssertCloseTo(payload.bazaarFrom, DateTime.Parse(body.GetProperty("bazaarFrom").GetString()!));
        AssertCloseTo(payload.bazaarUntil, DateTime.Parse(body.GetProperty("bazaarUntil").GetString()!));
        Assert.Equal(sellerTypeId, body.GetProperty("defaultTypeId").GetString());
        Assert.Equal(payload.infoText, body.GetProperty("infoText").GetString());
        Assert.Equal(payload.startNumber, body.GetProperty("startNumber").GetInt32());
        Assert.Equal(payload.blockSize, body.GetProperty("blockSize").GetInt32());
        Assert.Equal(payload.defaultBlockCount, body.GetProperty("defaultBlockCount").GetInt32());
    }

    [Fact]
    public async Task Put_NonAdmin_Returns403()
    {
        var client = await CreateNonAdminClientAsync();
        var now = DateTime.UtcNow;
        var payload = new
        {
            registrationDeadline = now, dropOffFrom = now, dropOffUntil = now,
            bazaarFrom = now, bazaarUntil = now, defaultTypeId = (string?)null,
            infoText = (string?)null, startNumber = 1, blockSize = 10, defaultBlockCount = 1
        };

        var response = await client.PutAsJsonAsync("/api/settings", payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Put_UnknownDefaultTypeId_Returns400()
    {
        var (client, _) = await CreateAdminClientAsync();
        var now = DateTime.UtcNow;
        var payload = new
        {
            registrationDeadline = now, dropOffFrom = now, dropOffUntil = now,
            bazaarFrom = now, bazaarUntil = now, defaultTypeId = "does-not-exist",
            infoText = (string?)null, startNumber = 1, blockSize = 10, defaultBlockCount = 1
        };

        var response = await client.PutAsJsonAsync("/api/settings", payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Put_DescendingDates_Returns400()
    {
        var (client, sellerTypeId) = await CreateAdminClientAsync();
        var now = DateTime.UtcNow;
        var payload = new
        {
            registrationDeadline = now, dropOffFrom = now.AddDays(-1), dropOffUntil = now,
            bazaarFrom = now, bazaarUntil = now, defaultTypeId = sellerTypeId,
            infoText = (string?)null, startNumber = 1, blockSize = 10, defaultBlockCount = 1
        };

        var response = await client.PutAsJsonAsync("/api/settings", payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Put_StartNumberBelowExistingArticle_Returns409()
    {
        var (client, sellerTypeId) = await CreateAdminClientAsync();
        using var scope = _factory.Services.CreateScope();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var article = Domain.Articles.Article.Create(
            sellerId: Guid.NewGuid().ToString("N")[..8], number: 50, name: "Testartikel", brand: "Marke",
            category: "Kategorie", price: 10m, size: null, color: null, description: null, nowUtc: DateTime.UtcNow);
        await articles.CreateAsync(article, newBlock: null, ct);

        var now = DateTime.UtcNow;
        var payload = new
        {
            registrationDeadline = now, dropOffFrom = now, dropOffUntil = now,
            bazaarFrom = now, bazaarUntil = now, defaultTypeId = sellerTypeId,
            infoText = (string?)null, startNumber = 100, blockSize = 10, defaultBlockCount = 1
        };

        var response = await client.PutAsJsonAsync("/api/settings", payload, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
}
