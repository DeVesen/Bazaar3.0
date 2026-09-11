using System.Reflection;
using NetArchTest.Rules;

namespace BAR.Architecture.Tests;

/// <summary>
/// Schliesst die Luecke, die Projektreferenzen offen lassen: sie verhindern eine
/// falsche Richtung zwischen Projekten, aber nicht, dass eine Domain-Klasse
/// Web- oder Serialisierungs-Annotationen traegt, und (seit dem Modulith-Schnitt)
/// nicht, dass ein Modul direkt in die Domain/Application/Infrastructure eines
/// anderen Moduls greift statt ueber dessen .Contracts (dotnet-modulith-bridge).
/// </summary>
public class DependencyDirectionTests
{
    private sealed record Module(string Name, Assembly Assembly);

    private static readonly Module Anmeldung = new("Anmeldung", typeof(Modules.Anmeldung.Domain.Articles.Article).Assembly);
    private static readonly Module Verkaeuferverwaltung = new("Verkaeuferverwaltung", typeof(Modules.Verkaeuferverwaltung.Domain.Sellers.Seller).Assembly);
    private static readonly Module Stammdaten = new("Stammdaten", typeof(Modules.Stammdaten.Domain.MasterData.Brand).Assembly);
    private static readonly Module Betrieb = new("Betrieb", typeof(Modules.Betrieb.Domain.Settings).Assembly);

    private static readonly Module[] AllModules = [Anmeldung, Verkaeuferverwaltung, Stammdaten, Betrieb];

    private static readonly Assembly Export = typeof(Modules.Export.Application.GetExportQueryHandler).Assembly;

    // Die implizite Program-Klasse der Top-Level-Statements ist internal und
    // nur fuer BAR.Host.IntegrationTests sichtbar — daher ein oeffentlicher
    // Host-Typ als Anker.
    private static readonly Assembly Host = typeof(Host.Features.Public.HealthEndpoints).Assembly;

    public static IEnumerable<object[]> AllModuleNames() => AllModules.Select(m => new object[] { m.Name, m.Assembly });

    public static IEnumerable<object[]> ModulePairs() =>
        from source in AllModules
        from target in AllModules
        where source.Name != target.Name
        select new object[] { source.Name, source.Assembly, target.Name };

    [Theory]
    [MemberData(nameof(AllModuleNames))]
    public void Domain_Always_HasNoDependencyOnFrameworks(string moduleName, Assembly assembly)
    {
        // Arrange & Act
        var result = Types.InAssembly(assembly)
            .That().ResideInNamespaceStartingWith($"BAR.Modules.{moduleName}.Domain")
            .Should()
            .NotHaveDependencyOnAny("Microsoft.EntityFrameworkCore", "Microsoft.AspNetCore", "System.Text.Json")
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, $"{moduleName}.Domain: {FailureMessage(result)}");
    }

    [Theory]
    [MemberData(nameof(AllModuleNames))]
    public void Domain_Always_HasNoDependencyOnOwnApplicationOrInfrastructure(string moduleName, Assembly assembly)
    {
        // Arrange & Act
        var result = Types.InAssembly(assembly)
            .That().ResideInNamespaceStartingWith($"BAR.Modules.{moduleName}.Domain")
            .Should()
            .NotHaveDependencyOnAny($"BAR.Modules.{moduleName}.Application", $"BAR.Modules.{moduleName}.Infrastructure")
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, $"{moduleName}.Domain: {FailureMessage(result)}");
    }

    [Theory]
    [MemberData(nameof(AllModuleNames))]
    public void Application_Always_HasNoDependencyOnOwnInfrastructure(string moduleName, Assembly assembly)
    {
        // Arrange & Act
        var result = Types.InAssembly(assembly)
            .That().ResideInNamespaceStartingWith($"BAR.Modules.{moduleName}.Application")
            .Should()
            .NotHaveDependencyOn($"BAR.Modules.{moduleName}.Infrastructure")
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, $"{moduleName}.Application: {FailureMessage(result)}");
    }

    [Theory]
    [MemberData(nameof(AllModuleNames))]
    public void Infrastructure_Always_ContainsNoHandlers(string moduleName, Assembly assembly)
    {
        // Arrange & Act — Infrastructure darf Application referenzieren (fuer die
        // eigenen Ports/Abstractions), aber keine eigene Anwendungslogik tragen.
        var result = Types.InAssembly(assembly)
            .That().ResideInNamespaceStartingWith($"BAR.Modules.{moduleName}.Infrastructure")
            .Should()
            .NotHaveNameEndingWith("Handler")
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, $"{moduleName}.Infrastructure: {FailureMessage(result)}");
    }

    [Theory]
    [MemberData(nameof(AllModuleNames))]
    public void RepositoryPorts_Always_LiveInDomainPorts(string moduleName, Assembly assembly)
    {
        // Arrange & Act
        var result = Types.InAssembly(assembly)
            .That()
            .ResideInNamespaceStartingWith($"BAR.Modules.{moduleName}")
            .And().HaveNameEndingWith("Repository")
            .And().AreInterfaces()
            .Should()
            .ResideInNamespaceStartingWith($"BAR.Modules.{moduleName}.Domain.Ports")
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, $"{moduleName}: {FailureMessage(result)}");
    }

    /// <summary>
    /// Der Kern des Modulith-Schnitts: ein Modul darf ein anderes ausschliesslich
    /// ueber dessen .Contracts-Projekt ansprechen (eigener Namespace, von dieser
    /// Regel nicht erfasst), nie dessen Domain/Application/Infrastructure direkt.
    /// </summary>
    [Theory]
    [MemberData(nameof(ModulePairs))]
    public void Module_Always_OnlyReferencesOtherModulesContracts(string sourceName, Assembly sourceAssembly, string targetName)
    {
        // Arrange & Act
        var result = Types.InAssembly(sourceAssembly)
            .Should()
            .NotHaveDependencyOnAny(
                $"BAR.Modules.{targetName}.Domain",
                $"BAR.Modules.{targetName}.Application",
                $"BAR.Modules.{targetName}.Infrastructure")
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, $"{sourceName} -> {targetName}: {FailureMessage(result)}");
    }

    [Fact]
    public void Export_Always_OnlyReferencesOtherModulesContracts()
    {
        // Arrange & Act — Export hat kein eigenes .Contracts (einziger
        // Referenzierer ist der Host), darf aber wie jedes andere Modul nur die
        // Contracts der Module ansprechen, deren Daten es fuer den Export braucht.
        var result = Types.InAssembly(Export)
            .Should()
            .NotHaveDependencyOnAny(AllModules
                .SelectMany(m => new[] { $"BAR.Modules.{m.Name}.Domain", $"BAR.Modules.{m.Name}.Application", $"BAR.Modules.{m.Name}.Infrastructure" })
                .ToArray())
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void Host_Always_HasNoDependencyOnNpgsql()
    {
        // Arrange & Act
        var result = Types.InAssembly(Host)
            .Should()
            .NotHaveDependencyOnAny("Npgsql")
            .GetResult();

        // Assert — nur die Module kennen den Provider (R-14).
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void Host_Always_OnlyReferencesModulesContracts()
    {
        // Arrange & Act — Ausnahme: die Add<Modul>Module()-DI-Erweiterung im
        // Composition Root (Program.cs) referenziert zwangslaeufig auch die
        // Implementierungs-Assembly, siehe dotnet-modulith-bridge. Diese Regel
        // haelt darum die Feature-Endpoints separat gegen, nicht die ganze
        // Host-Assembly.
        var result = Types.InAssembly(Host)
            .That().ResideInNamespaceStartingWith("BAR.Host.Features")
            .Should()
            .NotHaveDependencyOnAny(AllModules
                .SelectMany(m => new[] { $"BAR.Modules.{m.Name}.Domain", $"BAR.Modules.{m.Name}.Application", $"BAR.Modules.{m.Name}.Infrastructure" })
                .ToArray())
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    private static string FailureMessage(NetArchTest.Rules.TestResult result) =>
        result.FailingTypeNames is { Count: > 0 }
            ? $"Verletzende Typen: {string.Join(", ", result.FailingTypeNames)}"
            : "Regel verletzt.";
}
