using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
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

        // Regression: FluentValidation liefert PropertyName als Dictionary-Key
        // (PascalCase); ohne globale DictionaryKeyPolicy matcht das Frontend
        // (camelCase-Feldnamen) nie einen Fehler-Key.
        var body = await response.Content.ReadFromJsonAsync<JsonElement>(TestContext.Current.CancellationToken);
        var errors = body.GetProperty("errors");
        Assert.True(errors.TryGetProperty("firstName", out _));
        Assert.False(errors.TryGetProperty("FirstName", out _));
    }

    [Fact]
    public async Task PutProfileEmail_CorrectPassword_ChangesEmailAndOldEmailStopsWorking()
    {
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@example.com";
        await client.PostAsJsonAsync("/api/auth/register", new
        {
            email, password = "geheim123!", firstName = "Anna", lastName = "Beispiel",
            address = "Hauptstr. 1", postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
        }, TestContext.Current.CancellationToken);
        var loginResponse = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "geheim123!" }, TestContext.Current.CancellationToken);
        var tokens = await loginResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", tokens!.AccessToken);
        var newEmail = $"{Guid.NewGuid()}@example.com";

        var response = await client.PutAsJsonAsync("/api/profile/email", new { newEmail, currentPassword = "geheim123!" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
        var loginWithNewEmail = await client.PostAsJsonAsync("/api/auth/login", new { email = newEmail, password = "geheim123!" }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.OK, loginWithNewEmail.StatusCode);
        var loginWithOldEmail = await client.PostAsJsonAsync("/api/auth/login", new { email, password = "geheim123!" }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, loginWithOldEmail.StatusCode);
    }

    [Fact]
    public async Task PutProfileEmail_WrongPassword_Returns401()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PutAsJsonAsync("/api/profile/email", new { newEmail = "neu@example.com", currentPassword = "falsch" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PutProfileEmail_AlreadyTaken_Returns409()
    {
        var otherClient = _factory.CreateClient();
        var otherEmail = $"{Guid.NewGuid()}@example.com";
        await otherClient.PostAsJsonAsync("/api/auth/register", new
        {
            email = otherEmail, password = "geheim123!", firstName = "Ben", lastName = "Y",
            address = (string?)null, postalCode = "1", city = "Berlin", phone = "0"
        }, TestContext.Current.CancellationToken);
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PutAsJsonAsync("/api/profile/email", new { newEmail = otherEmail, currentPassword = "geheim123!" }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }

    [Fact]
    public async Task PutProfilePassword_CorrectCurrentPassword_ReturnsNewTokenPairAndInvalidatesOldRefreshToken()
    {
        var client = _factory.CreateClient();
        var email = $"{Guid.NewGuid()}@example.com";
        var registerResponse = await client.PostAsJsonAsync("/api/auth/register", new
        {
            email, password = "geheim123!", firstName = "Anna", lastName = "Beispiel",
            address = "Hauptstr. 1", postalCode = "76133", city = "Karlsruhe", phone = "0721 12345"
        }, TestContext.Current.CancellationToken);
        var originalTokens = await registerResponse.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", originalTokens!.AccessToken);

        var response = await client.PutAsJsonAsync("/api/profile/password", new
        {
            currentPassword = "geheim123!", newPassword = "neuGeheim456!", newPasswordConfirmation = "neuGeheim456!"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var newTokens = await response.Content.ReadFromJsonAsync<TokenPair>(TestContext.Current.CancellationToken);
        Assert.NotEqual(originalTokens.RefreshToken, newTokens!.RefreshToken);

        var refreshWithOldToken = await client.PostAsJsonAsync("/api/auth/refresh", new { refreshToken = originalTokens.RefreshToken }, TestContext.Current.CancellationToken);
        Assert.Equal(HttpStatusCode.Unauthorized, refreshWithOldToken.StatusCode);
    }

    [Fact]
    public async Task PutProfilePassword_WrongCurrentPassword_Returns401()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PutAsJsonAsync("/api/profile/password", new
        {
            currentPassword = "falsch", newPassword = "neuGeheim456!", newPasswordConfirmation = "neuGeheim456!"
        }, TestContext.Current.CancellationToken);

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task PutProfilePassword_ConfirmationMismatch_Returns400()
    {
        var client = await RegisterAndAuthenticateAsync();

        var response = await client.PutAsJsonAsync("/api/profile/password", new
        {
            currentPassword = "geheim123!", newPassword = "neuGeheim456!", newPasswordConfirmation = "anders789!"
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
