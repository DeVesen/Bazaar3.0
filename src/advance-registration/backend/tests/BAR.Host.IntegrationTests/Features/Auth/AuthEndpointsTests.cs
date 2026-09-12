using System.Net;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Auth;

public class AuthEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;

    public AuthEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record ProblemPayload(string? Detail, string? ErrorCode);

    private static object ValidRegisterPayload(string email, string password = "geheim123!") => new
    {
        email, password,
        firstName = "Anna", lastName = "Beispiel", address = "Hauptstr. 1",
        postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
    };

    [Fact]
    public async Task Register_NewEmail_Returns201WithTokenPair()
    {
        await RegistrationTestSeed.EnableRegistrationAsync(_factory.Services, TestContext.Current.CancellationToken);
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@example.com";

        var response = await client.PostAsJsonAsync("/api/auth/register",
            ValidRegisterPayload(email), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Created, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        Assert.False(string.IsNullOrEmpty(body!.AccessToken));
        Assert.False(string.IsNullOrEmpty(body.RefreshToken));
    }

    [Fact]
    public async Task Register_DuplicateEmail_Returns409WithSellerEmailTaken()
    {
        await RegistrationTestSeed.EnableRegistrationAsync(_factory.Services, TestContext.Current.CancellationToken);
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@example.com";
        await client.PostAsJsonAsync("/api/auth/register", ValidRegisterPayload(email), TestContext.Current.CancellationToken);

        var response = await client.PostAsJsonAsync("/api/auth/register", ValidRegisterPayload(email), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<ProblemPayload>(TestContext.Current.CancellationToken);
        Assert.Equal("seller.email_taken", body!.ErrorCode);
    }

    [Fact]
    public async Task Register_WeakPassword_Returns400()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register",
            ValidRegisterPayload($"{Guid.NewGuid()}@example.com", password: "abc"), TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Register_MissingLastName_Returns400()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"{Guid.NewGuid()}@example.com", password = "geheim123!",
            firstName = "Anna", lastName = "", address = (string?)null,
            postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Login_SeededAdmin_Returns200WithTokenPair()
    {
        await AdminTestSeed.EnsureAdminAsync(_factory.Services, "admin@bazaar.local", "Admin123!", TestContext.Current.CancellationToken);
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { email = "admin@bazaar.local", password = "Admin123!" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task Login_WrongPassword_Returns401()
    {
        await AdminTestSeed.EnsureAdminAsync(_factory.Services, "admin@bazaar.local", "Admin123!", TestContext.Current.CancellationToken);
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login",
            new { email = "admin@bazaar.local", password = "wrong" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task Refresh_SecondCallWithSameToken_Returns401()
    {
        await RegistrationTestSeed.EnableRegistrationAsync(_factory.Services, TestContext.Current.CancellationToken);
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@example.com";
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", ValidRegisterPayload(email), TestContext.Current.CancellationToken);
        var tokens = await registerResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);

        var first = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = tokens!.RefreshToken }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, first.StatusCode);

        var second = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = tokens.RefreshToken }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, second.StatusCode);
    }

    [Theory]
    [InlineData("{}")]
    [InlineData("{\"refreshToken\":null}")]
    [InlineData("{\"refreshToken\":\"\"}")]
    public async Task Refresh_BodyWithoutToken_Returns400NotServerError(string body)
    {
        // System.Text.Json does not enforce non-nullable properties on a
        // positional record - without a validator, null would flow through to
        // RefreshToken.HashOf and result in a 500.
        var client = _factory.CreateClient();
        using var content = new StringContent(body, System.Text.Encoding.UTF8, "application/json");

        var response = await client.PostAsync("/api/auth/refresh", content, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}
