using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.PostgreSql;

namespace BAR.Host.IntegrationTests.Features.Public;

/// <summary>
/// Starts the app against a real PostgreSQL container (VPROJ-S05
/// Testcontainers requirement) so the migration startup (Program.cs,
/// <c>ApplyMigrationsAsync</c>/<c>WaitForDatabaseAsync</c>) runs through
/// before the endpoints become reachable. Also reused by task 20's
/// <c>/health/ready</c> test.
/// </summary>
public sealed class PostgresWebApplicationFactory : WebApplicationFactory<Program>, IAsyncLifetime
{
    private readonly PostgreSqlContainer _postgres = new PostgreSqlBuilder("postgres:18-alpine")
        .Build();

    public async ValueTask InitializeAsync()
    {
        await _postgres.StartAsync();
    }

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseSetting("ConnectionStrings:DefaultConnection", _postgres.GetConnectionString());
    }

    public override async ValueTask DisposeAsync()
    {
        await _postgres.DisposeAsync();
        await base.DisposeAsync();
    }
}

/// <summary>
/// Proof that the test infrastructure runs against the real endpoint
/// registration (VPROJ-S05 AC-7). <c>/health</c> is liveness and deliberately
/// checks no database (VPROJ-S02 AC-4) - the Postgres fixture is still needed
/// because the migration startup now runs before every request.
/// </summary>
public class HealthEndpointTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public HealthEndpointTests(PostgresWebApplicationFactory factory)
    {
        _factory = factory;
    }

    [Fact]
    public async Task GetHealth_WithoutToken_ReturnsHealthy()
    {
        // Arrange
        var client = _factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;

        // Act
        var response = await client.GetAsync("/health", cancellationToken);

        // Assert
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);

        var body = await response.Content.ReadFromJsonAsync<HealthPayload>(cancellationToken);
        Assert.NotNull(body);
        Assert.Equal("healthy", body.Status);
    }

    [Fact]
    public async Task GetHealthReady_WhenDatabaseReachable_ReturnsOk()
    {
        var client = _factory.CreateClient();
        var cancellationToken = TestContext.Current.CancellationToken;
        var response = await client.GetAsync("/health/ready", cancellationToken);
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    private sealed record HealthPayload(string Status);
}
