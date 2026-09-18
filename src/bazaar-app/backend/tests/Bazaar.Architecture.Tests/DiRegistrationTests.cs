using System.IO;
using System.Linq;
using System.Reflection;
using System.Text.RegularExpressions;

namespace Bazaar.Architecture.Tests;

/// <summary>
/// Round-16-Review-Fix: <c>GetArticleByIdHandler</c> wurde in Program.cs nicht als
/// Scoped Service registriert, obwohl der zugehörige Endpoint ihn per DI auflöst -
/// das fiel erst zur Laufzeit auf (InvalidOperationException bei jedem Aufruf von
/// GET /api/articles/{id}). Ein echter WebApplicationFactory-Boot scheitert ohne
/// laufende Datenbank (Program.cs migriert beim Start), deshalb prüft dieser Test
/// stattdessen per Reflection+Quelltext-Scan, dass jeder *Handler aus
/// Bazaar.Application auch tatsächlich in Program.cs registriert ist - ganz ohne
/// Docker/Testcontainer.
/// </summary>
public class DiRegistrationTests
{
    private static readonly Assembly ApplicationAssembly = Assembly.Load("Bazaar.Application");

    [Fact]
    public void AllApplicationHandlers_AreRegisteredInProgram()
    {
        var handlerTypeNames = ApplicationAssembly.GetTypes()
            .Where(type => type is { IsClass: true, IsAbstract: false } && type.Name.EndsWith("Handler", StringComparison.Ordinal))
            .Select(type => type.Name)
            .OrderBy(name => name, StringComparer.Ordinal)
            .ToList();

        Assert.True(handlerTypeNames.Count > 0, "Es wurden keine *Handler-Typen in Bazaar.Application gefunden - Assembly-Ladung prüfen.");

        var programSource = File.ReadAllText(FindProgramCsPath());

        var unregisteredHandlers = handlerTypeNames
            .Where(handlerName => !Regex.IsMatch(programSource, $@"AddScoped<{Regex.Escape(handlerName)}>\s*\(\s*\)"))
            .ToList();

        Assert.True(unregisteredHandlers.Count == 0,
            unregisteredHandlers.Count > 0
                ? $"Nicht in Program.cs registrierte Handler: {string.Join(", ", unregisteredHandlers)}"
                : "Regel verletzt.");
    }

    private static string FindProgramCsPath()
    {
        var directory = new DirectoryInfo(AppContext.BaseDirectory);
        while (directory is not null)
        {
            var candidate = Path.Combine(directory.FullName, "Bazaar.Api", "Program.cs");
            if (File.Exists(candidate))
            {
                return candidate;
            }

            directory = directory.Parent;
        }

        throw new FileNotFoundException("Bazaar.Api/Program.cs konnte ausgehend vom Testverzeichnis nicht gefunden werden.");
    }
}
