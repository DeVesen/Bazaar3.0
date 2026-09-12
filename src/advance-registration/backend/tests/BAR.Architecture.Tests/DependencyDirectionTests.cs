using System.Reflection;
using NetArchTest.Rules;

namespace BAR.Architecture.Tests;

/// <summary>
/// Closes the gap that project references leave open: they prevent a wrong
/// direction between projects, but not a domain class carrying web or
/// serialization annotations, and (since the modulith split) not a module
/// reaching directly into another module's Domain/Application/Infrastructure
/// instead of going through its .Contracts (dotnet-modulith-bridge).
/// </summary>
public class DependencyDirectionTests
{
    private sealed record Module(string Name, Assembly Assembly);

    private static readonly Module Registration = new("Registration", typeof(Modules.Registration.Domain.Articles.Article).Assembly);
    private static readonly Module SellerManagement = new("SellerManagement", typeof(Modules.SellerManagement.Domain.Sellers.Seller).Assembly);
    private static readonly Module MasterData = new("MasterData", typeof(Modules.MasterData.Domain.Catalog.Brand).Assembly);
    private static readonly Module Operations = new("Operations", typeof(Modules.Operations.Domain.Settings).Assembly);

    private static readonly Module[] AllModules = [Registration, SellerManagement, MasterData, Operations];

    private static readonly Assembly Export = typeof(Modules.Export.Application.GetExportQueryHandler).Assembly;

    // The implicit Program class of the top-level statements is internal and
    // only visible to BAR.Host.IntegrationTests — hence a public host type
    // as an anchor.
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
        // Arrange & Act — Infrastructure may reference Application (for its own
        // ports/abstractions), but must not carry its own application logic.
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
    /// The core of the modulith split: a module may address another only
    /// through its .Contracts project (its own namespace is not covered by
    /// this rule), never its Domain/Application/Infrastructure directly.
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
        // Arrange & Act — Export has no .Contracts of its own (its only
        // referencer is the host), but like every other module may only
        // address the Contracts of the modules whose data it needs for export.
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

        // Assert — only the modules know the provider (R-14).
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void Host_Always_OnlyReferencesModulesContracts()
    {
        // Arrange & Act — exception: the Add<Module>Module() DI extension in
        // the composition root (Program.cs) inevitably references the
        // implementation assembly too, see dotnet-modulith-bridge. This rule
        // therefore checks the feature endpoints separately, not the whole
        // host assembly.
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
