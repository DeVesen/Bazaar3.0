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
        Assert.Equal(sellerTypeId, body.GetProperty("defaultTypeId").GetString());
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
