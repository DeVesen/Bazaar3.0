using System.Reflection;
using NetArchTest.Rules;

namespace Bazaar.Architecture.Tests;

public class DependencyDirectionTests
{
    private static readonly Assembly DomainAssembly = Assembly.Load("Bazaar.Domain");
    private static readonly Assembly ApplicationAssembly = Assembly.Load("Bazaar.Application");

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
    public void RepositoryPorts_LiveInDomainPorts()
    {
        var result = Types.InAssembly(DomainAssembly)
            .That().HaveNameEndingWith("Repository").And().AreInterfaces()
            .Should().ResideInNamespace("Bazaar.Domain.Ports")
            .GetResult();
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    private static string FailureMessage(NetArchTest.Rules.TestResult result) =>
        result.FailingTypeNames is { Count: > 0 }
            ? $"Verletzende Typen: {string.Join(", ", result.FailingTypeNames)}"
            : "Regel verletzt.";
}
