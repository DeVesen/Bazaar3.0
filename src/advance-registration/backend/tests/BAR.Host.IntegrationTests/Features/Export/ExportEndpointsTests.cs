using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Application.Abstractions;
using BAR.Domain.Articles;
using BAR.Domain.Ports;
using BAR.Domain.Sellers;
using BAR.Domain.SellerTypes;
using BAR.Host.IntegrationTests.Features.Public;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.Export;

public class ExportEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ExportEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private async Task<HttpClient> CreateAdminClientAsync()
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
        return client;
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

        var response = await client.GetAsync("/api/export", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Get_NonAdmin_Returns403()
    {
        var client = await CreateNonAdminClientAsync();

        var response = await client.GetAsync("/api/export", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task Get_AsAdmin_ReturnsAttachmentWithTodaysFilename()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.GetAsync("/api/export", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        Assert.Equal("attachment", response.Content.Headers.ContentDisposition!.DispositionType);
        Assert.Equal($"basar-export-{DateTime.UtcNow:yyyy-MM-dd}.json", response.Content.Headers.ContentDisposition!.FileName);
    }

    [Fact]
    public async Task Get_WithoutFlags_ReturnsEmptyBrandsAndCategoriesArrays()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.GetAsync("/api/export", TestContext.Current.CancellationToken);
        var body = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);

        Assert.Equal(0, body.GetProperty("brands").GetArrayLength());
        Assert.Equal(0, body.GetProperty("categories").GetArrayLength());
    }

    [Fact]
    public async Task Get_SchemaMatchesExportContract()
    {
        var client = await CreateAdminClientAsync();
        using var scope = _factory.Services.CreateScope();
        var sellers = scope.ServiceProvider.GetRequiredService<ISellerRepository>();
        var types = scope.ServiceProvider.GetRequiredService<ISellerTypeRepository>();
        var articles = scope.ServiceProvider.GetRequiredService<IArticleRepository>();
        var ct = TestContext.Current.CancellationToken;
        var type = SellerType.Create($"Standard-{Guid.NewGuid():N}", 15m, 0.5m);
        await types.AddAsync(type, ct);
        var seller = Seller.CreateByAdmin("Anna", "Beispiel", null, "76133", "Karlsruhe", "0721 1", $"{Guid.NewGuid()}@example.com", type.Id, false);
        await sellers.AddAsync(seller, ct);
        await articles.CreateAsync(Article.Create(seller.Id, 101, "Jacke", "Nike", "Jacken", 25m, "M", "Blau", null, DateTime.UtcNow), null, ct);

        var response = await client.GetAsync("/api/export", ct);
        var body = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(ct);

        var exportedSeller = body.GetProperty("sellers").EnumerateArray().Single(s => s.GetProperty("id").GetString() == seller.Id);
        Assert.Equal("Standard", exportedSeller.GetProperty("sellerType").GetString()!.Split('-')[0] == "Standard" ? "Standard" : exportedSeller.GetProperty("sellerType").GetString());
        Assert.False(exportedSeller.TryGetProperty("commissionRate", out _));
        Assert.False(exportedSeller.TryGetProperty("itemFee", out _));
        var article = exportedSeller.GetProperty("articles").EnumerateArray().Single();
        Assert.Equal("Nike", article.GetProperty("brand").GetString());
    }
}
