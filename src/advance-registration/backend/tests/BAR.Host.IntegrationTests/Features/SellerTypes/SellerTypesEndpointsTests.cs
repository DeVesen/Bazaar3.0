using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;
using BAR.Modules.MasterData.Domain.Ports;
using BAR.Modules.MasterData.Domain.SellerTypes;
using BAR.Modules.SellerManagement.Application.Abstractions;
using BAR.Modules.SellerManagement.Domain.Ports;
using BAR.Modules.SellerManagement.Domain.Sellers;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Features.SellerTypes;

public class SellerTypesEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public SellerTypesEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

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

    [Fact]
    public async Task Get_Unauthenticated_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/seller-types", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Post_AsAdmin_Creates201()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.PostAsJsonAsync("/api/seller-types", new { name = $"Standard-{Guid.NewGuid():N}", commissionRate = 12.5m, itemFee = 0.50m }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
    }

    [Fact]
    public async Task Post_InvalidCommissionRate_Returns400()
    {
        var client = await CreateAdminClientAsync();

        var response = await client.PostAsJsonAsync("/api/seller-types", new { name = $"X-{Guid.NewGuid():N}", commissionRate = 150m, itemFee = 0.50m }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Put_ChangesValues_Returns200()
    {
        var client = await CreateAdminClientAsync();
        var created = await client.PostAsJsonAsync("/api/seller-types", new { name = $"Y-{Guid.NewGuid():N}", commissionRate = 10m, itemFee = 0.20m }, TestContext.Current.CancellationToken);
        var body = await created.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        var id = body.GetProperty("id").GetString();

        var response = await client.PutAsJsonAsync($"/api/seller-types/{id}", new { name = "Geändert", commissionRate = 15m, itemFee = 0.30m }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var updated = await response.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        Assert.Equal("Geändert", updated.GetProperty("name").GetString());
    }

    [Fact]
    public async Task Delete_Unused_Returns204()
    {
        var client = await CreateAdminClientAsync();
        var created = await client.PostAsJsonAsync("/api/seller-types", new { name = $"Z-{Guid.NewGuid():N}", commissionRate = 10m, itemFee = 0.20m }, TestContext.Current.CancellationToken);
        var body = await created.Content.ReadFromJsonAsync<System.Text.Json.JsonElement>(TestContext.Current.CancellationToken);
        var id = body.GetProperty("id").GetString();

        var response = await client.DeleteAsync($"/api/seller-types/{id}", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }
}
