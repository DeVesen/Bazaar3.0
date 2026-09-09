using System.Reflection;
using NetArchTest.Rules;

namespace BAR.Architecture.Tests;

/// <summary>
/// Schliesst die Luecke, die Projektreferenzen offen lassen: sie verhindern eine
/// falsche Richtung zwischen Projekten, aber nicht, dass eine Domain-Klasse
/// Web- oder Serialisierungs-Annotationen traegt (VPROJ-S05 AC-5).
/// </summary>
public class DependencyDirectionTests
{
    private static readonly Assembly Domain = typeof(Domain.Common.EntityId).Assembly;
    private static readonly Assembly Application = typeof(Application.Abstractions.IClock).Assembly;
    private static readonly Assembly Infrastructure = typeof(Infrastructure.Time.SystemClock).Assembly;

    // Die implizite Program-Klasse der Top-Level-Statements ist internal und
    // nur fuer BAR.Host.IntegrationTests sichtbar — daher ein oeffentlicher
    // Host-Typ als Anker.
    private static readonly Assembly Host = typeof(Host.Features.Public.HealthEndpoints).Assembly;

    [Fact]
    public void Domain_Always_HasNoDependencyOnFrameworks()
    {
        // Arrange & Act
        var result = Types.InAssembly(Domain)
            .Should()
            .NotHaveDependencyOnAny(
                "Microsoft.EntityFrameworkCore",
                "Microsoft.AspNetCore",
                "System.Text.Json")
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void Application_Always_HasNoDependencyOnInfrastructure()
    {
        // Arrange & Act
        var result = Types.InAssembly(Application)
            .Should()
            .NotHaveDependencyOn("BAR.Infrastructure")
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

        // Assert — nur BAR.Infrastructure kennt den Provider (R-14).
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void Domain_Always_HasNoDependencyOnApplicationOrInfrastructure()
    {
        // Arrange & Act
        var result = Types.InAssembly(Domain)
            .Should()
            .NotHaveDependencyOnAny("BAR.Application", "BAR.Infrastructure", "BAR.Host")
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void Infrastructure_Always_ContainsNoHandlers()
    {
        // Arrange & Act
        var result = Types.InAssembly(Infrastructure)
            .Should()
            .NotHaveNameEndingWith("Handler")
            .GetResult();

        // Assert
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    [Fact]
    public void RepositoryPorts_Always_LiveInDomainPorts()
    {
        // Arrange & Act
        var result = Types.InAssembly(Domain)
            .That()
            .HaveNameEndingWith("Repository")
            .And()
            .AreInterfaces()
            .Should()
            .ResideInNamespaceStartingWith("BAR.Domain.Ports")
            .GetResult();

        // Assert — greift erst, sobald die ersten Ports existieren (VPROJ-S04).
        Assert.True(result.IsSuccessful, FailureMessage(result));
    }

    private static string FailureMessage(NetArchTest.Rules.TestResult result) =>
        result.FailingTypeNames is { Count: > 0 }
            ? $"Verletzende Typen: {string.Join(", ", result.FailingTypeNames)}"
            : "Regel verletzt.";
}
