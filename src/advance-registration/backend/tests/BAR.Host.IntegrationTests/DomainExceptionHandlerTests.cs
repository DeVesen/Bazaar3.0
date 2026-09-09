using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.AspNetCore.TestHost;

namespace BAR.Host.IntegrationTests;

public class DomainExceptionHandlerTests : IClassFixture<Features.Public.PostgresWebApplicationFactory>
{
    private readonly Features.Public.PostgresWebApplicationFactory _factory;

    public DomainExceptionHandlerTests(Features.Public.PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task ConflictException_MapsTo409WithErrorCode()
    {
        var client = _factory.WithWebHostBuilder(builder =>
            builder.Configure(app =>
            {
                app.UseExceptionHandler();
                app.UseRouting();
                app.UseEndpoints(endpoints => endpoints.MapGet("/__test/conflict", (HttpContext _) =>
                    throw new BAR.Domain.Exceptions.ConflictException("seller.email_taken", "Diese E-Mail ist bereits registriert")));
            })).CreateClient();

        var response = await client.GetAsync("/__test/conflict", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var body = await response.Content.ReadFromJsonAsync<ProblemPayload>(TestContext.Current.CancellationToken);
        Assert.Equal("seller.email_taken", body!.ErrorCode);
    }

    [Fact]
    public async Task ArticleNumberConflictException_MapsTo409WithNextNumberExtension()
    {
        var client = _factory.WithWebHostBuilder(builder =>
            builder.Configure(app =>
            {
                app.UseExceptionHandler();
                app.UseRouting();
                app.UseEndpoints(endpoints => endpoints.MapGet("/__test/article-number-conflict", (HttpContext _) =>
                    throw new BAR.Domain.Exceptions.ArticleNumberConflictException(
                        "Artikelnummer 104 ist inzwischen vergeben — neue Nummer: 105", 105)));
            })).CreateClient();

        var response = await client.GetAsync("/__test/article-number-conflict", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        Assert.Equal("application/problem+json", response.Content.Headers.ContentType?.MediaType);
        var body = await response.Content.ReadFromJsonAsync<NextNumberProblemPayload>(TestContext.Current.CancellationToken);
        Assert.Equal(105, body!.NextNumber);
    }

    private sealed record ProblemPayload(string? Detail, string? ErrorCode);
    private sealed record NextNumberProblemPayload(string? Detail, string? ErrorCode, int NextNumber);
}
