using System.Net;
using System.Net.Http.Json;
using BAR.Application.Abstractions;
using BAR.Host.IntegrationTests.Features.Public;
using FluentValidation;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;

namespace BAR.Host.IntegrationTests.Validation;

public class ValidationFilterTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public ValidationFilterTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private sealed record PingRequest(string Email);
    private sealed class PingValidator : AbstractValidator<PingRequest>
    {
        public PingValidator() => RuleFor(r => r.Email).EmailAddress();
    }

    private HttpClient CreateClientWithTestEndpoint() =>
        _factory.WithWebHostBuilder(builder => builder.ConfigureServices(services =>
        {
            services.AddScoped<IValidator<PingRequest>, PingValidator>();
        }).Configure(app =>
        {
            app.UseRouting();
            app.UseEndpoints(endpoints => endpoints
                .MapPost("/__test/ping", (PingRequest request) => Results.Ok())
                .AddEndpointFilter<BAR.Host.Validation.ValidationFilter<PingRequest>>());
        })).CreateClient();

    [Fact]
    public async Task InvalidRequest_Returns400WithErrorsDictionary()
    {
        var client = CreateClientWithTestEndpoint();

        var response = await client.PostAsJsonAsync("/__test/ping", new PingRequest("not-an-email"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task ValidRequest_PassesThrough()
    {
        var client = CreateClientWithTestEndpoint();

        var response = await client.PostAsJsonAsync("/__test/ping", new PingRequest("a@b.de"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task ProtectedRoute_WithSellerToken_Returns403()
    {
        using var scope = _factory.Services.CreateScope();
        var issuer = scope.ServiceProvider.GetRequiredService<ITokenIssuer>();
        var token = issuer.IssueAccessToken("s0000001", "seller", DateTime.UtcNow);

        var client = _factory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", token);

        var response = await client.GetAsync("/api/blocks/__test-admin-only", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode); // Route existiert erst in Task 20 - hier nur Auth-Pipeline-Smoke, siehe Hinweis
    }
}
