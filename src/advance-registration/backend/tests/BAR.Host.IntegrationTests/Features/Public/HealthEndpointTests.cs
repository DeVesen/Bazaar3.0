using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Testcontainers.PostgreSql;

namespace BAR.Host.IntegrationTests.Features.Public;

/// <summary>
/// Startet die App gegen einen echten PostgreSQL-Container (VPROJ-S05
/// Testcontainers-Vorgabe), damit der Migrations-Startup (Program.cs,
/// <c>ApplyMigrationsAsync</c>/<c>WaitForDatabaseAsync</c>) durchlaeuft, bevor
/// die Endpoints erreichbar sind. Wird auch von Task 20's
/// <c>/health/ready</c>-Test wiederverwendet.
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
/// Nachweis, dass die Testinfrastruktur gegen die echte Endpoint-Registrierung
/// laeuft (VPROJ-S05 AC-7). <c>/health</c> ist Liveness und prueft bewusst
/// keine Datenbank (VPROJ-S02 AC-4) - die Postgres-Fixture ist trotzdem noetig,
/// weil der Migrations-Startup jetzt vor jedem Request steht.
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

    private sealed record HealthPayload(string Status);
}
