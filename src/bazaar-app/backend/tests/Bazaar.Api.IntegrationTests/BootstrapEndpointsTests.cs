using System.Net;
using System.Net.Http.Json;

namespace Bazaar.Api.IntegrationTests;

public class BootstrapEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public BootstrapEndpointsTests(PostgresWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetBootstrapStatus_FreshDatabase_ReturnsHasAdminFalse()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/public/bootstrap-status", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<BootstrapStatusBody>(TestContext.Current.CancellationToken);
        Assert.False(body!.HasAdmin);
    }

    [Fact]
    public async Task PostBootstrapAdmin_FreshDatabase_CreatesAdminAndReturnsToken()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "first-admin", password = "changeme1" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<BootstrapAdminBody>(TestContext.Current.CancellationToken);
        Assert.False(string.IsNullOrEmpty(body!.AccessToken));
    }

    [Fact]
    public async Task PostBootstrapAdmin_CalledTwice_SecondCallReturnsConflict()
    {
        var client = _factory.CreateClient();
        await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "second-admin-flow", password = "changeme1" },
            TestContext.Current.CancellationToken);

        var response = await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "another-admin", password = "changeme1" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    private sealed record BootstrapStatusBody(bool HasAdmin);
    private sealed record BootstrapAdminBody(string AccessToken);
}
