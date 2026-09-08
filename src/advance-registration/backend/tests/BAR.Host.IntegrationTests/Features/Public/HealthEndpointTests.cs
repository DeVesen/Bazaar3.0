using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;

namespace BAR.Host.IntegrationTests.Features.Public;

/// <summary>
/// Nachweis, dass die Testinfrastruktur gegen die echte Endpoint-Registrierung
/// laeuft (VPROJ-S05 AC-7). Ohne Datenbank - <c>/health</c> ist Liveness und
/// prueft bewusst keine Datenbank (VPROJ-S02 AC-4).
/// </summary>
public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
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
        response.StatusCode.Should().Be(HttpStatusCode.OK);

        var body = await response.Content.ReadFromJsonAsync<HealthPayload>(cancellationToken);
        body!.Status.Should().Be("healthy");
    }

    private sealed record HealthPayload(string Status);
}
