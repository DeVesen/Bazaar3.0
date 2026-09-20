using System.Net;
using System.Net.Http.Json;

namespace Bazaar.Api.IntegrationTests;

/// <summary>
/// Does NOT use IClassFixture&lt;PostgresWebApplicationFactory&gt;: every test here needs a
/// database with no admin yet, or needs to reason about its own two calls only. xUnit gives
/// no guaranteed execution order within a class, and a class fixture is shared across all
/// tests in the class - so with a shared fixture, whichever bootstrap-admin test happened to
/// run first would leave an admin behind for the others, making "fresh database" assertions
/// order-dependent false positives/negatives. Each test below therefore gets its own
/// dedicated PostgresWebApplicationFactory (own container, own empty database) via
/// IAsyncLifetime on the test class itself - xUnit creates a fresh instance of the test class
/// per test method, so InitializeAsync/DisposeAsync here run once per test, not once per class.
/// </summary>
public class BootstrapEndpointsTests : IAsyncLifetime
{
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
        // Self-contained: both calls happen against this test's own fresh database, and only
        // the SECOND of these two calls is asserted to conflict - the first call is expected
        // to succeed here (fresh DB, nobody else could have created an admin already).
        var client = _factory.CreateClient();
        var firstResponse = await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "second-admin-flow", password = "changeme1" },
            TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, firstResponse.StatusCode);

        var secondResponse = await client.PostAsJsonAsync(
            "/api/public/bootstrap-admin",
            new { username = "another-admin", password = "changeme1" },
            TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, secondResponse.StatusCode);
    }

    private sealed record BootstrapStatusBody(bool HasAdmin);
    private sealed record BootstrapAdminBody(string AccessToken);
}
