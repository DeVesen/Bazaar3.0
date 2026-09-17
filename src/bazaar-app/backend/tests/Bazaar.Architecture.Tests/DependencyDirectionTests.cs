using System.Linq;
using System.Reflection;
using NetArchTest.Rules;

namespace Bazaar.Architecture.Tests;

public class DependencyDirectionTests
{
    private static readonly Assembly DomainAssembly = Assembly.Load("Bazaar.Domain");
    private static readonly Assembly ApplicationAssembly = Assembly.Load("Bazaar.Application");
    private static readonly Assembly InfrastructureAssembly = Assembly.Load("Bazaar.Infrastructure");

    [Fact]
    public void Domain_HasNoDependencyOnFrameworks()
    {
        var result = Types.InAssembly(DomainAssembly)
            .Should().NotHaveDependencyOnAny("Microsoft.EntityFrameworkCore", "Microsoft.AspNetCore", "System.Text.Json")
            .GetResult();
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void Application_HasNoDependencyOnInfrastructure()
    {
        var result = Types.InAssembly(ApplicationAssembly)
            .Should().NotHaveDependencyOn("Bazaar.Infrastructure")
            .GetResult();
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void RepositoryAndQueryPorts_LiveInDomainPorts()
    {
        var scannedAssemblies = new[] { DomainAssembly, ApplicationAssembly, InfrastructureAssembly };

        // NetArchTest's fluent predicate chain has no grouping, so
        // "...HaveNameEndingWith(A).Or().HaveNameEndingWith(B).And().AreInterfaces()"
        // evaluates as "(A) Or (B And AreInterfaces())", not the intended
        // "(A Or B) And AreInterfaces()" — that would flag concrete
        // *Repository classes (e.g. UserRepository) as violations even though
        // only *Repository/*Query interfaces are meant to be restricted to
        // Bazaar.Domain.Ports. Filtering manually avoids that grouping gap.
        var violatingTypeNames = scannedAssemblies
            .SelectMany(assembly => assembly.GetTypes())
            .Where(type => type.IsInterface
                && (type.Name.EndsWith("Repository", StringComparison.Ordinal)
                    || type.Name.EndsWith("Query", StringComparison.Ordinal))
                && type.Namespace != "Bazaar.Domain.Ports")
            .Select(type => type.FullName ?? type.Name)
            .ToList();

        Assert.True(violatingTypeNames.Count == 0,
            violatingTypeNames.Count > 0
                ? $"Verletzende Typen: {string.Join(", ", violatingTypeNames)}"
                : "Regel verletzt.");
    }

    private static string FailureMessage(NetArchTest.Rules.TestResult result) =>
        result.FailingTypeNames is { Count: > 0 }
            ? $"Verletzende Typen: {string.Join(", ", result.FailingTypeNames)}"
            : "Regel verletzt.";
}
