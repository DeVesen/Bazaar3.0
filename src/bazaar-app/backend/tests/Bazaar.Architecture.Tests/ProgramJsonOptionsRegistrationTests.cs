using System.IO;

namespace Bazaar.Architecture.Tests;

/// <summary>
/// Round-27 review fix (Important): UsersJsonBindingTests now builds its
/// <see cref="System.Text.Json.JsonSerializerOptions"/> via
/// <c>Bazaar.Api.Json.AppJsonOptions.ConfigureEnumsAsCamelCaseStrings</c> - the same method
/// Program.cs is supposed to call via ConfigureHttpJsonOptions - instead of duplicating the
/// converter setup by hand. That closes the "logic drifts apart" gap, but on its own it would not
/// catch Program.cs's *call* to that method being deleted entirely (the unit test would still be
/// green, while POST/PUT /api/users would 400 again on a lowercase "role"). A real
/// WebApplicationFactory&lt;Program&gt; boot would catch that, but Program.cs migrates the database
/// on startup and there is no Testcontainers/Docker available in this environment (see
/// PostgresWebApplicationFactory in Bazaar.Api.IntegrationTests, which needs Docker). This test
/// closes the gap the same way DiRegistrationTests does for handler registrations: a
/// Docker-free source-text scan of the real Program.cs.
/// </summary>
public class ProgramJsonOptionsRegistrationTests
{
    [Fact]
    public void Program_RegistersAppJsonOptions_ForHttpJson()
    {
        var programSource = File.ReadAllText(RepoFiles.Find(Path.Combine("Bazaar.Api", "Program.cs")));

        Assert.Contains("ConfigureHttpJsonOptions", programSource, StringComparison.Ordinal);
        Assert.Contains("AppJsonOptions.ConfigureEnumsAsCamelCaseStrings", programSource, StringComparison.Ordinal);
    }
}
