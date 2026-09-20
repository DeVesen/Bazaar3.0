using System.Text.Json;
using System.Text.Json.Serialization;
using Bazaar.Application.Users;
using Bazaar.Domain.Users;

namespace Bazaar.Api.UnitTests.Features.Users;

/// <summary>
/// Round-27 final review (C-1/C-2): a Minimal API delegate can't be invoked directly in a
/// unit test, so this proves the actual wire contract at the layer that matters — deserializing
/// the LITERAL JSON payloads from docs/requirements/bazaar-app/api/users.md §2/§3 into
/// <see cref="CreateUserCommand"/>/<see cref="UpdateUserCommand"/>, using the same options
/// Program.cs registers via ConfigureHttpJsonOptions (Web defaults + a camelCase
/// JsonStringEnumConverter). Mirrors ImportResponseSerializationTests'/SettlementEndpointsTests'
/// approach of asserting the actual serialized/deserialized JSON behavior rather than just
/// constructing the C# command with the enum already set (which is what every prior Users test
/// did, and why it never caught either bug: without the converter, "role":"cashier" fails to
/// deserialize at all — the handler is never reached — and NewRole previously didn't bind from
/// "role" in the first place).
/// </summary>
public class UsersJsonBindingTests
{
    private static readonly JsonSerializerOptions AppOptions = CreateAppOptions();

    private static JsonSerializerOptions CreateAppOptions()
    {
        var options = new JsonSerializerOptions(JsonSerializerDefaults.Web);
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
        return options;
    }

    [Fact]
    public void CreateUserCommand_DeserializesSpecShape_WithLowercaseRole()
    {
        const string json = """{ "username": "kasse2", "role": "cashier", "initialPassword": "password123" }""";

        var command = JsonSerializer.Deserialize<CreateUserCommand>(json, AppOptions);

        Assert.NotNull(command);
        Assert.Equal("kasse2", command!.Username);
        Assert.Equal(Role.Cashier, command.Role);
        Assert.Equal("password123", command.InitialPassword);
    }

    [Fact]
    public void CreateUserCommand_DeserializesAdminRole()
    {
        const string json = """{ "username": "anna", "role": "admin", "initialPassword": "password123" }""";

        var command = JsonSerializer.Deserialize<CreateUserCommand>(json, AppOptions);

        Assert.NotNull(command);
        Assert.Equal(Role.Admin, command!.Role);
    }

    [Fact]
    public void CreateUserCommand_WithoutEnumConverter_ThrowsOnStringRole()
    {
        // Proves the root cause of C-1: without the JsonStringEnumConverter that
        // Program.cs registers globally, System.Text.Json's Web defaults reject a
        // string value for an enum property entirely - the request never reaches
        // validation or the handler.
        const string json = """{ "username": "kasse2", "role": "cashier", "initialPassword": "password123" }""";
        var optionsWithoutConverter = new JsonSerializerOptions(JsonSerializerDefaults.Web);

        Assert.Throws<JsonException>(() =>
            JsonSerializer.Deserialize<CreateUserCommand>(json, optionsWithoutConverter));
    }

    [Fact]
    public void UpdateUserCommand_DeserializesRoleOnlyBody_FromRoleKey()
    {
        const string json = """{ "role": "admin" }""";

        var command = JsonSerializer.Deserialize<UpdateUserCommand>(json, AppOptions);

        Assert.NotNull(command);
        Assert.Equal(Role.Admin, command!.Role);
        Assert.Null(command.NewPassword);
    }

    [Fact]
    public void UpdateUserCommand_DeserializesPasswordOnlyBody()
    {
        const string json = """{ "newPassword": "newpassword1" }""";

        var command = JsonSerializer.Deserialize<UpdateUserCommand>(json, AppOptions);

        Assert.NotNull(command);
        Assert.Null(command!.Role);
        Assert.Equal("newpassword1", command.NewPassword);
    }

    [Fact]
    public void CreateUserResponseDto_SerializesRole_AsLowercaseString()
    {
        // Confirms adding the global enum converter has not broken the existing outbound
        // "admin"/"cashier" casing (UserDto.Role is already a plain string built via
        // UserEndpoints.ToRoleString, so it never goes through the enum converter - this
        // locks that behavior in explicitly).
        var dto = new Bazaar.Api.Features.Users.UserDto("e2a6d4b8", "kasse2", "cashier", true);

        var json = JsonSerializer.Serialize(dto, AppOptions);
        using var document = JsonDocument.Parse(json);

        Assert.Equal("cashier", document.RootElement.GetProperty("role").GetString());
    }
}
