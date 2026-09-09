using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using BAR.Host.IntegrationTests.Features.Public;

namespace BAR.Host.IntegrationTests.Features.Profile;

public class ProfileEndpointsTests : IClassFixture<PostgresWebApplicationFactory>
{
    private readonly PostgresWebApplicationFactory _factory;
    public ProfileEndpointsTests(PostgresWebApplicationFactory factory) => _factory = factory;

    [Fact]
    public async Task GetProfile_WithoutToken_Returns401()
    {
        var client = _factory.CreateClient();

        var response = await client.GetAsync("/api/profile", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetProfile_AfterRegistration_ReturnsOwnProfileWithResolvedSellerType()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.GetAsync("/api/profile", TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<ProfilePayload>(TestContext.Current.CancellationToken);
        Assert.Equal("Anna", profile!.FirstName);
        Assert.NotNull(profile.SellerType);
    }

    [Fact]
    public async Task PutProfile_ValidBody_UpdatesAndIgnoresEmail()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PutAsJsonAsync("/api/profile", new
        {
            firstName = "Anna-Maria", lastName = "Muster", address = "Neue Str. 2",
            postalCode = "76135", city = "Ettlingen", phone = "0721 99999",
            email = "sollte-ignoriert-werden@example.com"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var profile = await response.Content.ReadFromJsonAsync<ProfilePayload>(TestContext.Current.CancellationToken);
        Assert.Equal("Ettlingen", profile!.City);
        Assert.NotEqual("sollte-ignoriert-werden@example.com", profile.Email);
    }

    [Fact]
    public async Task PutProfile_MissingRequiredField_Returns400()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PutAsJsonAsync("/api/profile", new
        {
            firstName = "", lastName = "Muster", address = (string?)null,
            postalCode = "76135", city = "Ettlingen", phone = "0721 99999"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    private async Task<HttpClient> RegisterAndAuthenticateAsync()
    {
        var client = _factory.CreateClient();
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email = $"{Guid.NewGuid()}@example.com", password = "geheim123!",
            firstName = "Anna", lastName = "Beispiel", address = "Hauptstr. 1",
            postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
        }, TestContext.Current.CancellationToken);
        var tokens = await registerResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        return client;
    }

    private sealed record TokenPair(string AccessToken, string RefreshToken);
    private sealed record SellerTypePayload(string Id, string Name, decimal CommissionRate, decimal ItemFee);
    private sealed record ProfilePayload(string Id, string FirstName, string City, string Email, SellerTypePayload SellerType);
}
