using System.Text.Json;
using System.Text.Json.Serialization;

namespace Bazaar.Api.Json;

/// <summary>
/// Round-27-Review-Fix (Important): the enum-as-camelCase-string JSON convention used to be
/// duplicated - Program.cs registered it via <c>ConfigureHttpJsonOptions</c>, while
/// UsersJsonBindingTests rebuilt an equivalent <see cref="JsonSerializerOptions"/> by hand. That
/// duplication meant the test could stay green even if Program.cs's registration were removed or
/// changed - exactly the wire-contract regression the test exists to prevent (POST/PUT
/// /api/users would 400 on a lowercase "role" again). Both call sites now share this single
/// method, so a change to the actual configuration logic is caught by the test. A real
/// end-to-end check that Program.cs still *calls* this method lives in
/// Bazaar.Architecture.Tests (ProgramJsonOptionsRegistrationTests), since a genuine
/// WebApplicationFactory boot needs Postgres via Testcontainers/Docker, which is not available
/// in this environment.
/// </summary>
public static class AppJsonOptions
{
    /// <summary>
    /// Applies the app-wide convention that enums (currently <see cref="Bazaar.Domain.Users.Role"/>)
    /// round-trip as camelCase strings ("admin"/"cashier") instead of System.Text.Json's numeric
    /// default.
    /// </summary>
    public static void ConfigureEnumsAsCamelCaseStrings(JsonSerializerOptions options) =>
        options.Converters.Add(new JsonStringEnumConverter(JsonNamingPolicy.CamelCase));
}
