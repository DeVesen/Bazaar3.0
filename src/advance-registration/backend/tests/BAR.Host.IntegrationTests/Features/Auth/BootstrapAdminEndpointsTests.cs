using System.Net;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Auth;

/// <summary>
/// Own PostgresWebApplicationFactory instance (own Testcontainer, own
/// database) - AdminBootstrapState is computed once at that container's
/// startup, so this class must not share a database with any test that
/// seeds an admin directly (e.g. AdminTestSeed-based classes), or
/// HasAdmin would already be true before these tests run.
/// </summary>
public class BootstrapAdminEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public BootstrapAdminEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record ProblemPayload(string? Detail, string? ErrorCode);
    private sealed record BootstrapStatus(bool HasAdmin);

    private static object ValidPayload(string email, string password = "geheim123!") => new
    {
        email, password,
        firstName = "Anna", lastName = "Beispiel", address = "Hauptstr. 1",
        postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
    };

    [Fact]
    public async Task BootstrapLifecycle_OnFreshSystem_CreatesFirstAdminThenLocksItself()
    {
        var ct = TestContext.Current.CancellationToken;
        var client = _factory.CreateClient();

        var beforeStatus = await client.GetFromJsonAsync<BootstrapStatus>("/api/public/bootstrap-status", ct);
        Assert.False(beforeStatus!.HasAdmin);

        var email = $"{Guid.NewGuid()}@example.com";
        var createResponse = await client.PostAsJsonAsync("/api/auth/bootstrap-admin", ValidPayload(email), ct);
        Assert.Equal(HttpStatusCode.Created, createResponse.StatusCode);
        var tokens = await createResponse.Content.ReadFromJsonAsync<TokenPair>(ct);
        Assert.False(string.IsNullOrEmpty(tokens!.AccessToken));

        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "geheim123!" }, ct);
        Assert.Equal(HttpStatusCode.OK, loginResponse.StatusCode);

        var afterStatus = await client.GetFromJsonAsync<BootstrapStatus>("/api/public/bootstrap-status", ct);
        Assert.True(afterStatus!.HasAdmin);

        var secondAttempt = await client.PostAsJsonAsync(
            "/api/auth/bootstrap-admin", ValidPayload($"{Guid.NewGuid()}@example.com"), ct);
        Assert.Equal(HttpStatusCode.Conflict, secondAttempt.StatusCode);
        var body = await secondAttempt.Content.ReadFromJsonAsync<ProblemPayload>(ct);
        Assert.Equal("bootstrap.already_done", body!.ErrorCode);
    }
}
